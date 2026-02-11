import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface CameraLevelGuideProps {
  enabled: boolean;
}

export function CameraLevelGuide({ enabled }: CameraLevelGuideProps) {
  const { gamma, beta, isSupported, permissionDenied, requestPermission } = useDeviceOrientation(enabled);

  // iOS needs explicit permission request
  const needsPermission = !isSupported && !permissionDenied && typeof (DeviceOrientationEvent as any).requestPermission === 'function';

  if (!enabled) return null;

  // If orientation not available, show a simple text tip instead
  if (!isSupported && !needsPermission) {
    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground">Hold phone flat & parallel to surface</p>
        </div>
      </div>
    );
  }

  if (needsPermission) {
    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={requestPermission}
          className="px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-sm text-xs text-primary font-medium"
        >
          Tap to enable level guide
        </button>
      </div>
    );
  }

  if (permissionDenied) return null;

  // Calculate tilt: gamma = left/right, beta adjusted for phone held upright (~90° when vertical)
  // When shooting down at a flat surface, beta ≈ 90 (phone vertical pointing down)
  // We want to detect deviation from "pointing straight down" → beta deviation from 90
  const betaOffset = beta - 90; // 0 when phone points straight down
  const gammaOffset = gamma;     // 0 when level left-right

  const tiltMagnitude = Math.sqrt(betaOffset * betaOffset + gammaOffset * gammaOffset);
  const isLevel = tiltMagnitude < 5;
  const isClose = tiltMagnitude < 15;

  // Clamp offsets for visual indicator
  const clampedX = Math.max(-30, Math.min(30, gammaOffset));
  const clampedY = Math.max(-30, Math.min(30, betaOffset));

  const statusColor = isLevel ? 'rgb(34, 197, 94)' : isClose ? 'rgb(250, 204, 21)' : 'rgb(239, 68, 68)';
  const statusText = isLevel ? '✓ Level' : isClose ? 'Almost level' : 'Tilt to level';

  return (
    <>
      {/* Level bubble indicator */}
      <div className="absolute top-16 right-4 z-10 pointer-events-none flex flex-col items-center gap-1.5">
        <div
          className="relative w-14 h-14 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: statusColor,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Center crosshair */}
          <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40" />
          {/* Moving dot */}
          <div
            className="absolute w-3 h-3 rounded-full transition-all duration-100"
            style={{
              backgroundColor: statusColor,
              transform: `translate(${clampedX * 0.6}px, ${clampedY * 0.6}px)`,
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
        </div>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            color: statusColor,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          {statusText}
        </span>
      </div>
    </>
  );
}
