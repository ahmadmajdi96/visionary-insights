import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, X, RotateCcw, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const videoConstraints = {
    facingMode: { exact: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
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
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Camera View */}
          <div className="relative w-full h-full">
            {!capturedImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={() => setIsCameraReady(true)}
                  onUserMediaError={(e) => console.error('Camera error:', e)}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(1)' }}
                />
                
                {/* Loading overlay */}
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
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
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 safe-bottom">
              <div className="flex items-center justify-center gap-6 p-6 pb-8">
                {!capturedImage ? (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={capture}
                    disabled={!isCameraReady}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow disabled:opacity-50"
                  >
                    <CameraIcon className="w-8 h-8 text-primary-foreground" />
                  </motion.button>
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
      )}
    </AnimatePresence>
  );
}
