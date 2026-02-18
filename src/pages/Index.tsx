import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Scan, RefreshCw, Loader2 } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { JobList } from '@/components/JobList';
import { Camera } from '@/components/Camera';
import { CaptureButton } from '@/components/CaptureButton';
import { ResultsView } from '@/components/ResultsView';
import { ApiSettings } from '@/components/ApiSettings';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { storeId, planogramId } = useParams<{ storeId: string; planogramId: string }>();
  const navigate = useNavigate();
  const { stores, planograms } = useAuth();
  const store = stores.find((s) => s.id === storeId);
  const planogram = planograms.find((p) => p.id === planogramId);
  const { jobs, isSubmitting, isLoading, submitNewJob, getJob, deleteJob, refreshJobs } = useJobs();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshJobs();
    setIsRefreshing(false);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/stores/${storeId}/planograms`)}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-foreground truncate">
              {planogram?.name || 'Scans'}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {store?.name} · {isLoading ? 'Loading...' : `${jobs.length} scan${jobs.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <ApiSettings />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="w-10 h-10 rounded-full"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Job List */}
      <main className="pt-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading jobs from server...</p>
          </div>
        ) : (
          <JobList jobs={jobs} onJobClick={handleJobClick} onDeleteJob={deleteJob} />
        )}
      </main>

      {/* Capture Button */}
      <CaptureButton onClick={() => setIsCameraOpen(true)} />

      {/* Camera Modal */}
      <Camera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Index;
