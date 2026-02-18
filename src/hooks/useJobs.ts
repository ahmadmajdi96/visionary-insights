import { useState, useCallback, useEffect, useRef } from 'react';
import { Job, JobStatus, JobResult } from '@/types/job';
import { submitImage, getJobStatus, getJobResults, getAllJobs, deleteJob as deleteJobApi } from '@/services/api';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useJobs() {
  const { planogramId } = useParams<{ planogramId: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          status: status.status as JobStatus, 
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
          status: status.status as JobStatus, 
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
          status: status.status as JobStatus, 
          stage: status.stage,
          updated_at: status.updated_at 
        });
      }
    } catch (error) {
      console.error('Error polling job status:', error);
    }
  }, [updateJob]);

  const startPolling = useCallback((jobId: string) => {
    // Don't start polling if already polling
    if (pollingRef.current.has(jobId)) return;
    
    // Poll immediately
    pollJobStatus(jobId);
    
    // Then poll every 2 seconds
    const interval = setInterval(() => pollJobStatus(jobId), 2000);
    pollingRef.current.set(jobId, interval);
  }, [pollJobStatus]);

  // Fetch all jobs from server on mount
  const fetchAllJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverJobs = await getAllJobs(planogramId);
      
      const mappedJobs: Job[] = serverJobs.map((job: any) => {
        // Build result from inline data if images are present
        const result: JobResult | undefined = job.images ? {
          job_id: job.job_id,
          status: job.status as JobStatus,
          total_images: job.total_images || job.images.length,
          images: job.images,
        } : job.result;
        
        return {
          job_id: job.job_id,
          status: (job.status as JobStatus) || 'QUEUED',
          stage: job.stage,
          updated_at: job.updated_at,
          planogram_id: job.planogram_id,
          result,
        };
      });
      
      setJobs(mappedJobs);
      
      // Start polling for jobs that are still in progress
      mappedJobs.forEach(job => {
        if (job.status === 'QUEUED' || job.status === 'RUNNING') {
          startPolling(job.job_id);
        }
      });
      
      // Fetch results for completed jobs that don't have results yet
      mappedJobs.forEach(async (job) => {
        if (job.status === 'SUCCEEDED' && !job.result) {
          try {
            const result = await getJobResults(job.job_id);
            updateJob(job.job_id, { result });
          } catch (e) {
            console.error('Failed to fetch results for job:', job.job_id, e);
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "⚠️ Could not load jobs",
        description: error instanceof Error ? error.message : "Failed to fetch jobs from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [startPolling, updateJob]);

  // Fetch jobs on mount
  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

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

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      // Stop polling if running
      const interval = pollingRef.current.get(jobId);
      if (interval) {
        clearInterval(interval);
        pollingRef.current.delete(jobId);
      }
      
      await deleteJobApi(jobId);
      setJobs(prev => prev.filter(job => job.job_id !== jobId));
      
      toast({
        title: "🗑️ Job Deleted",
        description: `Job ${jobId.slice(0, 8)}... has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "❌ Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete job.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const refreshJobs = useCallback(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  return {
    jobs,
    isSubmitting,
    isLoading,
    submitNewJob,
    getJob,
    deleteJob,
    refreshJobs,
  };
}
