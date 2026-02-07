import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Scan } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { JobList } from '@/components/JobList';
import { Camera } from '@/components/Camera';
import { CaptureButton } from '@/components/CaptureButton';
import { ResultsView } from '@/components/ResultsView';

const Index = () => {
  const { jobs, isSubmitting, submitNewJob, getJob } = useJobs();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = selectedJobId ? getJob(selectedJobId) : null;

  const handleCapture = async (file: File, localImageUrl: string) => {
    await submitNewJob(file, localImageUrl);
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBack = () => {
    setSelectedJobId(null);
  };

  // Show results view if a job is selected
  if (selectedJob) {
    return <ResultsView job={selectedJob} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Image Scanner
            </h1>
            <p className="text-xs text-muted-foreground">
              {jobs.length} scan{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Job List */}
      <main className="pt-4">
        <JobList jobs={jobs} onJobClick={handleJobClick} />
      </main>

      {/* Capture Button */}
      <CaptureButton onClick={() => setIsCameraOpen(true)} />

      {/* Camera Modal */}
      <AnimatePresence>
        <Camera
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCapture}
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </div>
  );
};

export default Index;
