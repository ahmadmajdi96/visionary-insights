import { useState, useCallback, useEffect, useRef } from 'react';
import { Job } from '@/types/job';
import { submitImage, getJobStatus, getJobResults } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const updateJob = useCallback((jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.job_id === jobId ? { ...job, ...updates } : job
    ));
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const status = await getJobStatus(jobId);
      
      if (status.status === 'SUCCEEDED') {
        // Stop polling and fetch results
        const interval = pollingRef.current.get(jobId);
        if (interval) {
          clearInterval(interval);
          pollingRef.current.delete(jobId);
        }
        
        const result = await getJobResults(jobId);
        updateJob(jobId, { 
          status: status.status, 
          stage: status.stage,
          updated_at: status.updated_at,
          result 
        });
        
        toast({
          title: "✅ Scan Complete!",
          description: `Job ${jobId.slice(0, 8)}... finished with ${result.images?.[0]?.objects?.length || 0} objects detected.`,
        });
      } else if (status.status === 'FAILED') {
        // Stop polling on failure
        const interval = pollingRef.current.get(jobId);
        if (interval) {
          clearInterval(interval);
          pollingRef.current.delete(jobId);
        }
        updateJob(jobId, { 
          status: status.status, 
          stage: status.stage,
          updated_at: status.updated_at 
        });
        
        toast({
          title: "❌ Scan Failed",
          description: `Job ${jobId.slice(0, 8)}... encountered an error.`,
          variant: "destructive",
        });
      } else {
        updateJob(jobId, { 
          status: status.status, 
          stage: status.stage,
          updated_at: status.updated_at 
        });
      }
    } catch (error) {
      console.error('Error polling job status:', error);
    }
  }, [updateJob]);

  const startPolling = useCallback((jobId: string) => {
    // Poll immediately
    pollJobStatus(jobId);
    
    // Then poll every 2 seconds
    const interval = setInterval(() => pollJobStatus(jobId), 2000);
    pollingRef.current.set(jobId, interval);
  }, [pollJobStatus]);

  const submitNewJob = useCallback(async (file: File, localImageUrl: string) => {
    setIsSubmitting(true);
    try {
      const response = await submitImage(file);
      
      const newJob: Job = {
        job_id: response.job_id,
        status: response.status,
        localImageUrl,
      };
      
      setJobs(prev => [newJob, ...prev]);
      startPolling(response.job_id);
      
      toast({
        title: "📤 Image Submitted",
        description: "Your image is being processed...",
      });
      
      return response.job_id;
    } catch (error) {
      console.error('Error submitting job:', error);
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : "Failed to submit image. Check if the server is reachable and allows CORS.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [startPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRef.current.forEach(interval => clearInterval(interval));
      pollingRef.current.clear();
    };
  }, []);

  const getJob = useCallback((jobId: string) => {
    return jobs.find(job => job.job_id === jobId);
  }, [jobs]);

  return {
    jobs,
    isSubmitting,
    submitNewJob,
    getJob,
  };
}
