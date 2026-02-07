import { AnimatePresence } from 'framer-motion';
import { Job } from '@/types/job';
import { JobCard } from './JobCard';
import { ImageIcon } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
  onDeleteJob: (jobId: string) => Promise<void>;
}

export function JobList({ jobs, onJobClick, onDeleteJob }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          No scans yet
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-[240px]">
          Take a photo to start scanning and analyzing images
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-24">
      <AnimatePresence mode="popLayout">
        {jobs.map((job) => (
          <JobCard
            key={job.job_id}
            job={job}
            onClick={() => onJobClick(job.job_id)}
            onDelete={onDeleteJob}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
