import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Grid, Image as ImageIcon, LayoutGrid, ShoppingCart } from 'lucide-react';
import { Job } from '@/types/job';
import { getImageUrl, getFilenameFromPath } from '@/services/api';
import { ObjectCard } from './ObjectCard';
import { PlanogramView } from './PlanogramView';
import { OSAView } from './OSAView';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResultsViewProps {
  job: Job;
  onBack: () => void;
}

type ViewMode = 'annotated' | 'objects' | 'planogram' | 'osa';

export function ResultsView({ job, onBack }: ResultsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('annotated');
  const result = job.result;
  const image = result?.images[0];
  const objects = image?.objects || [];

  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'annotated', label: 'Annotated', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'objects', label: `Objects (${objects.length})`, icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'planogram', label: 'Planogram', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'osa', label: 'OSA', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
  ];

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

        {/* View Toggle - scrollable tabs */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                viewMode === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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

        {viewMode === 'planogram' && image && (
          <PlanogramView image={image} />
        )}

        {viewMode === 'osa' && image && (
          <OSAView image={image} />
        )}
      </div>
    </motion.div>
  );
}
