import { CreateJobResponse, JobStatusResponse, JobResult, Job } from '@/types/job';

// Backend API configuration - uses Cloudflare tunnels for HTTPS access
// Main host: auth, data, files, etc.
const DEFAULT_HOST = 'https://establishment-single-monitors-wave.trycloudflare.com';
// Jobs host: job submission, status, results
const DEFAULT_JOBS_HOST = 'https://helena-invitations-mid-keen.trycloudflare.com';

export const API_STORAGE_KEY = 'app_api_host';
export const API_JOBS_STORAGE_KEY = 'app_api_jobs_host';

export function getApiHost(): string {
  return localStorage.getItem(API_STORAGE_KEY) || import.meta.env.VITE_API_HOST || DEFAULT_HOST;
}

export function getJobsApiHost(): string {
  return localStorage.getItem(API_JOBS_STORAGE_KEY) || import.meta.env.VITE_API_JOBS_HOST || DEFAULT_JOBS_HOST;
}

export function getApiBaseUrl(): string {
  return `${getApiHost()}/v1`;
}

export function getJobsApiBaseUrl(): string {
  return `${getJobsApiHost()}/v1`;
}

export function setApiUrls(host: string, jobsHost?: string): void {
  localStorage.setItem(API_STORAGE_KEY, host);
  if (jobsHost) {
    localStorage.setItem(API_JOBS_STORAGE_KEY, jobsHost);
  }
}

export function resetApiUrls(): void {
  localStorage.removeItem(API_STORAGE_KEY);
  localStorage.removeItem(API_JOBS_STORAGE_KEY);
}

export async function getAllJobs(planogramId?: string): Promise<Job[]> {
  try {
    const params = planogramId ? `?planogram_id=${encodeURIComponent(planogramId)}` : '';
    const response = await fetch(`${getJobsApiBaseUrl()}/jobs${params}`, {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    const data = await response.json();
    // API returns a raw array of jobs
    return Array.isArray(data) ? data : (data.jobs || []);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Server may be unreachable.');
    }
    throw error;
  }
}

export async function submitImage(file: File): Promise<CreateJobResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${getJobsApiBaseUrl()}/infer/image`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Server may be unreachable or blocking CORS requests. Please ensure the server allows requests from this origin.');
    }
    throw error;
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${getJobsApiBaseUrl()}/jobs/${jobId}`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobResults(jobId: string): Promise<JobResult> {
  const response = await fetch(`${getJobsApiBaseUrl()}/jobs/${jobId}/results`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job results: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`${getJobsApiBaseUrl()}/jobs/${jobId}`, {
    method: 'DELETE',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete job: ${response.statusText}`);
  }
}

export function getFilenameFromPath(path: string): string {
  // Extract filename from a path like /v1/jobs/xxx/files/annotated/image.jpg
  return path.split('/').pop() || path;
}

export function getImageUrl(jobId: string, type: 'annotated' | 'crops' | 'input', filename: string): string {
  return `${getJobsApiHost()}/v1/jobs/${jobId}/files/${type}/${filename}`;
}

export function getOriginalImageUrl(jobId: string, filename: string): string {
  return `${getJobsApiHost()}/v1/jobs/${jobId}/files/input/${filename}`;
}
