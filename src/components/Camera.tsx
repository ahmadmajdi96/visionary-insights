import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, X, RotateCcw, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CameraProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, localImageUrl: string) => Promise<void>;
  isSubmitting: boolean;
}

export function Camera({ isOpen, onClose, onCapture, isSubmitting }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [retryCount, setRetryCount] = useState(0);
  const [hasUserStartedCamera, setHasUserStartedCamera] = useState(false);

  const isIOS = useMemo(() => {
    // iPadOS can report as MacIntel with touch points
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
    const isIPadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleMobile || isIPadOS;
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (!isOpen) return;

    setCapturedImage(null);
    setIsCameraReady(false);
    setCameraError(null);
    setFacingMode('environment');
    setRetryCount(0);
    setHasUserStartedCamera(false);
  }, [isOpen]);

  // On iOS Safari, do NOT pre-request getUserMedia before the Webcam component mounts.
  // The double-request causes Safari to re-prompt for permission and often fail on the second grant.
  // Instead, rely on react-webcam to acquire the stream directly after the user taps "Start camera".

  const videoConstraints: MediaTrackConstraints = isIOS
    ? {
        // Use 'ideal' so Safari won't reject constraints but will still aim for high res
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      }
    : {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      };

  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error);
    
    // If environment camera fails, try user camera
    if (facingMode === 'environment' && retryCount === 0) {
      setRetryCount(1);
      setFacingMode('user');
      return;
    }
    
    // Both cameras failed
    const errorMessage = error instanceof DOMException 
      ? error.message || 'Camera access denied'
      : String(error);
    
    setCameraError(errorMessage || 'Unable to access camera');
    toast({
      title: "📷 Camera Error",
      description: "Could not access camera. Please check permissions.",
      variant: "destructive",
    });
  }, [facingMode, retryCount]);

  const capture = useCallback(() => {
    // Capture at the video's native sensor resolution (not the CSS display size)
    const video = webcamRef.current?.video;
    const nativeWidth = video?.videoWidth || 1920;
    const nativeHeight = video?.videoHeight || 1080;
    const imageSrc = webcamRef.current?.getScreenshot({ width: nativeWidth, height: nativeHeight });
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!capturedImage) return;

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

      await onCapture(file, capturedImage);
      setCapturedImage(null);
      onClose();
    } catch (error) {
      console.error('Error submitting image:', error);
    }
  }, [capturedImage, onCapture, onClose]);

  const handleClose = useCallback(() => {
    setCapturedImage(null);
    setIsCameraReady(false);
    setCameraError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="camera-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Camera View */}
        <div className="relative w-full h-full">
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-8">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Camera Error</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {cameraError}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Please ensure camera permissions are granted and try again.
              </p>
            </div>
           ) : !capturedImage ? (
            <>
              {!hasUserStartedCamera ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-8">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to scan</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    Tap the button below to start the camera.
                    {isIOS ? ' (iPhone/iPad Safari requires a user tap)' : ''}
                  </p>
                  <Button
                    onClick={() => setHasUserStartedCamera(true)}
                    className="rounded-full px-6"
                  >
                    Start camera
                  </Button>
                </div>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    key={`webcam-${facingMode}-${retryCount}`}
                    audio={false}
                    muted
                    playsInline
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1}
                    videoConstraints={videoConstraints}
                    onUserMedia={() => {
                      setIsCameraReady(true);
                      setCameraError(null);
                    }}
                    onUserMediaError={handleCameraError}
                    className="w-full h-full object-cover"
                    mirrored={facingMode === 'user'}
                  />

                  {/* Viewfinder guide overlay */}
                  {isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-24 sm:mt-0">
                      <div className="relative w-[90%] aspect-[3/5] sm:w-[80%] sm:aspect-[4/3] border-[3px] border-green-500 rounded-lg">
                        {/* Horizontal center line */}
                        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-green-500 opacity-70" />
                        {/* Corner accents */}
                        <div className="absolute -top-px -left-px w-5 h-5 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                        <div className="absolute -top-px -right-px w-5 h-5 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                        <div className="absolute -bottom-px -left-px w-5 h-5 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                        <div className="absolute -bottom-px -right-px w-5 h-5 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                        {/* Label */}
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap">
                          Align object flat within the frame
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Loading overlay */}
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Starting camera...</p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 safe-top">
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </Button>
              
              {/* Show which camera is being used */}
              {isCameraReady && !capturedImage && (
                <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs text-muted-foreground">
                  {facingMode === 'environment' ? '📷 Rear Camera' : '🤳 Front Camera'}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 safe-bottom">
            <div className="flex items-center justify-center gap-6 p-6 pb-8">
              {cameraError ? (
                <Button onClick={handleClose} variant="secondary">
                  Close
                </Button>
              ) : !capturedImage ? (
                hasUserStartedCamera ? (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={capture}
                    disabled={!isCameraReady}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow disabled:opacity-50"
                  >
                    <CameraIcon className="w-8 h-8 text-primary-foreground" />
                  </motion.button>
                ) : (
                  <div className="h-20" />
                )
              ) : (
                <>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={retake}
                    className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <RotateCcw className="w-6 h-6 text-secondary-foreground" />
                  </motion.button>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                    ) : (
                      <Send className="w-8 h-8 text-primary-foreground" />
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
