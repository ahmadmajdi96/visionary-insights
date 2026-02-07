import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { JobStatus } from '@/types/job';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobStatus;
  stage?: string;
  className?: string;
}

export function StatusBadge({ status, stage, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'QUEUED':
        return {
          icon: Clock,
          label: 'Queued',
          className: 'status-queued',
          animate: false,
        };
      case 'RUNNING':
        return {
          icon: Loader2,
          label: stage || 'Processing',
          className: 'status-running',
          animate: true,
        };
      case 'SUCCEEDED':
        return {
          icon: CheckCircle2,
          label: 'Complete',
          className: 'status-succeeded',
          animate: false,
        };
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Failed',
          className: 'status-failed',
          animate: false,
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          className: 'status-queued',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon 
        className={cn('w-3.5 h-3.5', config.animate && 'animate-spin')} 
      />
      <span className="capitalize">{config.label}</span>
    </motion.div>
  );
}
