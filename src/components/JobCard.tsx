import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Job } from '@/types/job';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { getOriginalImageUrl, getFilenameFromPath } from '@/services/api';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const isClickable = job.status === 'SUCCEEDED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className={cn(
        'bg-card rounded-lg shadow-soft p-4 flex items-center gap-4',
        isClickable && 'cursor-pointer active:scale-[0.98] transition-transform'
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {(() => {
          // Try to get original image from server first
          const serverImagePath = job.result?.images?.[0]?.image;
          if (serverImagePath) {
            const filename = getFilenameFromPath(serverImagePath);
            return (
              <img
                src={getOriginalImageUrl(job.job_id, filename)}
                alt="Original"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to local image if server image fails
                  if (job.localImageUrl) {
                    (e.target as HTMLImageElement).src = job.localImageUrl;
                  }
                }}
              />
            );
          }
          // Fallback to local image
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
      {isClickable && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-muted-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      )}
    </motion.div>
  );
}
