import { useState, useEffect, useRef } from 'react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface CameraLevelGuideProps {
  enabled: boolean;
}

function getDirectionHint(betaOffset: number, gammaOffset: number, threshold: number): string {
  if (Math.abs(betaOffset) < threshold && Math.abs(gammaOffset) < threshold) return '';
  // Pick the dominant axis
  if (Math.abs(betaOffset) > Math.abs(gammaOffset)) {
    return betaOffset > 0 ? 'Tilt top away from you' : 'Tilt top toward you';
  }
  return gammaOffset > 0 ? 'Tilt left side down' : 'Tilt right side down';
}

export function CameraLevelGuide({ enabled }: CameraLevelGuideProps) {
  const { gamma, beta, isSupported, permissionDenied, requestPermission } = useDeviceOrientation(enabled);
  const [stableSeconds, setStableSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const lastLevelTime = useRef<number | null>(null);

  const needsPermission = !isSupported && !permissionDenied && typeof (DeviceOrientationEvent as any).requestPermission === 'function';

  const betaOffset = beta - 90;
  const gammaOffset = gamma;
  const tiltMagnitude = Math.sqrt(betaOffset * betaOffset + gammaOffset * gammaOffset);
  const isLevel = tiltMagnitude < 5;
  const isClose = tiltMagnitude < 15;

  // Track how long we've been level
  useEffect(() => {
    if (!enabled || locked) return;
    if (isLevel) {
      if (!lastLevelTime.current) lastLevelTime.current = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - (lastLevelTime.current || Date.now())) / 1000;
        setStableSeconds(Math.min(elapsed, 3));
        if (elapsed >= 2) {
          setLocked(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      lastLevelTime.current = null;
      setStableSeconds(0);
    }
  }, [isLevel, enabled, locked]);

  // Reset lock when guide is disabled/re-enabled
  useEffect(() => {
    if (!enabled) {
      setLocked(false);
      setStableSeconds(0);
      lastLevelTime.current = null;
    }
  }, [enabled]);

  if (!enabled) return null;

  if (!isSupported && !needsPermission) {
    return (
      <div className="absolute top-16 left-0 right-0 z-10 pointer-events-none flex flex-col items-center gap-2 px-4">
        <div
          className="w-full max-w-xs rounded-xl px-4 py-3 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <p className="text-xs font-semibold text-white text-center mb-2">📐 Tips for best results</p>
          <ul className="space-y-1.5 text-[11px] text-white/80">
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-px">📱</span>
              <span>Hold phone <strong className="text-white">parallel</strong> to the surface, pointing straight down</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-px">💡</span>
              <span>Use <strong className="text-white">even lighting</strong> — avoid shadows & glare</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-px">🖼️</span>
              <span>Fill the <strong className="text-white">green frame</strong> with the object</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-px">✋</span>
              <span>Hold <strong className="text-white">steady</strong> for a sharp, blur-free image</span>
            </li>
          </ul>
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

  const clampedX = Math.max(-30, Math.min(30, gammaOffset));
  const clampedY = Math.max(-30, Math.min(30, betaOffset));

  const statusColor = locked
    ? 'rgb(34, 197, 94)'
    : isLevel
      ? 'rgb(34, 197, 94)'
      : isClose
        ? 'rgb(250, 204, 21)'
        : 'rgb(239, 68, 68)';

  const directionHint = getDirectionHint(betaOffset, gammaOffset, 5);
  const statusText = locked
    ? '🔒 Locked – Shoot now!'
    : isLevel
      ? `✓ Level – Hold steady ${stableSeconds > 0 ? `(${Math.ceil(2 - stableSeconds)}s)` : ''}`
      : directionHint || 'Tilt to level';

  // Progress ring for stable hold
  const progressPct = locked ? 100 : (stableSeconds / 2) * 100;

  return (
    <>
      {/* Coaching banner at top */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="px-4 py-2 rounded-full backdrop-blur-sm transition-colors duration-300"
          style={{ backgroundColor: `${statusColor}22`, border: `1px solid ${statusColor}66` }}
        >
          <p className="text-xs font-medium text-center whitespace-nowrap" style={{ color: statusColor }}>
            {statusText}
          </p>
        </div>
      </div>

      {/* Level bubble indicator */}
      <div className="absolute top-28 right-4 z-10 pointer-events-none flex flex-col items-center gap-1.5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="29"
              fill="none"
              stroke={statusColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * 58}`}
              strokeDashoffset={`${Math.PI * 58 * (1 - progressPct / 100)}`}
              className="transition-all duration-200"
            />
          </svg>
          {/* Inner bubble area */}
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            {locked ? (
              <span className="text-lg">✓</span>
            ) : (
              <>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-white/30" />
                <div
                  className="absolute w-3 h-3 rounded-full transition-all duration-75"
                  style={{
                    backgroundColor: statusColor,
                    transform: `translate(${clampedX * 0.5}px, ${clampedY * 0.5}px)`,
                    boxShadow: `0 0 8px ${statusColor}`,
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
