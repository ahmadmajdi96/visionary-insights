import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientationState {
  /** Left/right tilt in degrees (-180 to 180). 0 = level. */
  gamma: number;
  /** Front/back tilt in degrees (-90 to 90 when upright). */
  beta: number;
  /** Whether the device orientation API is supported & active. */
  isSupported: boolean;
  /** Whether iOS permission was denied. */
  permissionDenied: boolean;
  /** Request permission (needed on iOS 13+). */
  requestPermission: () => Promise<void>;
}

export function useDeviceOrientation(enabled: boolean): DeviceOrientationState {
  const [gamma, setGamma] = useState(0);
  const [beta, setBeta] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null) setGamma(e.gamma);
    if (e.beta !== null) setBeta(e.beta);
    setIsSupported(true);
  }, []);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setPermissionDenied(false);
        } else {
          setPermissionDenied(true);
        }
      } catch {
        setPermissionDenied(true);
      }
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (!enabled) return;

    const DOE = DeviceOrientationEvent as any;
    // iOS 13+ requires permission
    if (typeof DOE.requestPermission === 'function') {
      // Don't auto-request, user must tap a button
      return;
    }

    // Android / desktop - just listen
    window.addEventListener('deviceorientation', handleOrientation, true);
    // If no event fires within 1s, mark unsupported
    const timeout = setTimeout(() => {
      if (!isSupported) setIsSupported(false);
    }, 1000);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      clearTimeout(timeout);
    };
  }, [enabled, handleOrientation, isSupported]);

  return { gamma, beta, isSupported, permissionDenied, requestPermission };
}
