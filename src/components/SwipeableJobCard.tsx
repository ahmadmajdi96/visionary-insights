import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronRight, Trash2, Loader2, Check } from 'lucide-react';
import { Job } from '@/types/job';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { getOriginalImageUrl, getFilenameFromPath } from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';

interface SwipeableJobCardProps {
  job: Job;
  onClick: () => void;
  onDelete: (jobId: string) => Promise<void>;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
  onRequestDelete: (jobId: string) => void;
}

const SWIPE_THRESHOLD = 100;

export function SwipeableJobCard({
  job,
  onClick,
  onDelete,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onRequestDelete,
}: SwipeableJobCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isClickable = job.status === 'SUCCEEDED';
  const constraintsRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, -50], [1, 0]);
  const deleteScale = useTransform(x, [-SWIPE_THRESHOLD, -50], [1, 0.8]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onRequestDelete(job.job_id);
    }
  };

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect(job.job_id);
    } else if (isClickable) {
      onClick();
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      onToggleSelect(job.job_id);
    }
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-lg">
      {/* Delete background */}
      <motion.div
        className="absolute inset-y-0 right-0 w-24 bg-destructive flex items-center justify-center rounded-r-lg"
        style={{ opacity: deleteOpacity, scale: deleteScale }}
      >
        <Trash2 className="w-6 h-6 text-destructive-foreground" />
      </motion.div>

      {/* Card content */}
      <motion.div
        drag={!isSelectionMode ? 'x' : false}
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        layout
        whileTap={!isSelectionMode ? undefined : { scale: 0.98 }}
        onTap={handleCardClick}
        onTapStart={() => {
          // Long press detection
          const timer = setTimeout(handleLongPress, 500);
          const cleanup = () => clearTimeout(timer);
          window.addEventListener('pointerup', cleanup, { once: true });
          window.addEventListener('pointercancel', cleanup, { once: true });
        }}
        className={cn(
          'bg-card rounded-lg shadow-soft p-4 flex items-center gap-4 relative',
          (isClickable || isSelectionMode) && 'cursor-pointer',
          isSelected && 'ring-2 ring-primary'
        )}
      >
        {/* Selection checkbox */}
        {isSelectionMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-shrink-0"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(job.job_id)}
              className="w-5 h-5"
            />
          </motion.div>
        )}

        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {(() => {
            const serverImagePath = job.result?.images?.[0]?.image;
            if (serverImagePath) {
              const filename = getFilenameFromPath(serverImagePath);
              return (
                <img
                  src={getOriginalImageUrl(job.job_id, filename)}
                  alt="Original"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (job.localImageUrl) {
                      (e.target as HTMLImageElement).src = job.localImageUrl;
                    }
                  }}
                />
              );
            }
            if (job.localImageUrl) {
              return (
                <img
                  src={job.localImageUrl}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              );
            }
            return <div className="w-full h-full bg-muted" />;
          })()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate mb-1">
            Image Scan
          </p>
          <p className="text-xs text-muted-foreground truncate mb-2">
            {job.job_id.slice(0, 8)}...
          </p>
          <StatusBadge status={job.status} stage={job.stage} />
        </div>

        {/* Arrow for completed jobs */}
        {isClickable && !isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-muted-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
