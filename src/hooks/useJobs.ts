import { useState, useCallback, useEffect, useRef } from 'react';
import { Job, JobStatus } from '@/types/job';
import { submitImage, getJobStatus, getJobResults } from '@/services/api';

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
      
      return response.job_id;
    } catch (error) {
      console.error('Error submitting job:', error);
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
