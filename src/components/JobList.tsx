import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Job } from '@/types/job';
import { SwipeableJobCard } from './SwipeableJobCard';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ImageIcon, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface JobListProps {
  jobs: Job[];
  onJobClick: (jobId: string) => void;
  onDeleteJob: (jobId: string) => Promise<void>;
}

export function JobList({ jobs, onJobClick, onDeleteJob }: JobListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelectionMode = selectedIds.size > 0;

  const handleToggleSelect = useCallback((jobId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  }, []);

  const handleRequestDelete = useCallback((jobId: string) => {
    setPendingDeleteIds([jobId]);
  }, []);

  const handleBulkDeleteRequest = useCallback(() => {
    setPendingDeleteIds(Array.from(selectedIds));
  }, [selectedIds]);

  const handleCancelSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteIds.length === 0) return;

    setIsDeleting(true);
    try {
      await Promise.all(pendingDeleteIds.map((id) => onDeleteJob(id)));
      toast({
        title: '🗑️ Deleted',
        description: `${pendingDeleteIds.length} scan${pendingDeleteIds.length > 1 ? 's' : ''} deleted`,
      });
      // Clear selection after successful delete
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pendingDeleteIds.forEach((id) => next.delete(id));
        return next;
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Could not delete some scans. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setPendingDeleteIds([]);
    }
  }, [pendingDeleteIds, onDeleteJob]);

  const handleCloseDialog = useCallback(() => {
    if (!isDeleting) {
      setPendingDeleteIds([]);
    }
  }, [isDeleting]);

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
    <>
      {/* Selection toolbar */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-16 z-10 mx-4 mb-3 bg-card rounded-lg shadow-soft p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelSelection}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteRequest}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint for swipe/long-press */}
      {!isSelectionMode && jobs.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mb-3 px-4">
          Swipe left to delete • Long press to select multiple
        </p>
      )}

      <div className="space-y-3 px-4 pb-24">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <SwipeableJobCard
              key={job.job_id}
              job={job}
              onClick={() => onJobClick(job.job_id)}
              onDelete={onDeleteJob}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(job.job_id)}
              onToggleSelect={handleToggleSelect}
              onRequestDelete={handleRequestDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={pendingDeleteIds.length > 0}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        count={pendingDeleteIds.length}
        isDeleting={isDeleting}
      />
    </>
  );
}
