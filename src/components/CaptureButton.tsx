import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface CaptureButtonProps {
  onClick: () => void;
}

export function CaptureButton({ onClick }: CaptureButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-12 safe-bottom z-40 pointer-events-none">
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow pointer-events-auto"
      >
        <Camera className="w-7 h-7 text-primary-foreground" />
      </motion.button>
    </div>
  );
}
