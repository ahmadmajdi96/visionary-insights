import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Grid, Image as ImageIcon } from 'lucide-react';
import { Job } from '@/types/job';
import { getImageUrl, getFilenameFromPath } from '@/services/api';
import { ObjectCard } from './ObjectCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResultsViewProps {
  job: Job;
  onBack: () => void;
}

type ViewMode = 'annotated' | 'objects';

export function ResultsView({ job, onBack }: ResultsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('annotated');
  const result = job.result;
  const image = result?.images[0];
  const objects = image?.objects || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-semibold text-foreground">
              Scan Results
            </h1>
            <p className="text-xs text-muted-foreground">
              {objects.length} objects detected
            </p>
          </div>
          <div className="flex items-center gap-1 bg-status-succeeded-bg text-status-succeeded px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Complete</span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={() => setViewMode('annotated')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'annotated'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            <ImageIcon className="w-4 h-4" />
            Annotated
          </button>
          <button
            onClick={() => setViewMode('objects')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'objects'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            <Grid className="w-4 h-4" />
            Objects ({objects.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {viewMode === 'annotated' && image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg overflow-hidden shadow-medium"
          >
            <img
              src={getImageUrl(job.job_id, 'annotated', getFilenameFromPath(image.annotated))}
              alt="Annotated result"
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </motion.div>
        )}

        {viewMode === 'objects' && (
          <div className="grid grid-cols-2 gap-3">
            {objects.map((obj, index) => (
              <ObjectCard key={index} object={obj} index={index} jobId={job.job_id} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
