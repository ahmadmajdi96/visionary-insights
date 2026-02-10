import { CreateJobResponse, JobStatusResponse, JobResult, Job } from '@/types/job';

// Backend API configuration - uses Cloudflare tunnel for HTTPS access
const DEFAULT_HOST = 'https://realtors-himself-projected-meters.trycloudflare.com';
export const API_STORAGE_KEY = 'app_api_host';

export function getApiHost(): string {
  return localStorage.getItem(API_STORAGE_KEY) || import.meta.env.VITE_API_HOST || DEFAULT_HOST;
}

export function getApiBaseUrl(): string {
  return `${getApiHost()}/v1`;
}

export function setApiUrls(host: string): void {
  localStorage.setItem(API_STORAGE_KEY, host);
}

export function resetApiUrls(): void {
  localStorage.removeItem(API_STORAGE_KEY);
}

export interface AllJobsResponse {
  jobs: {
    job_id: string;
    status: string;
    stage?: string;
    updated_at?: string;
  }[];
}

export async function getAllJobs(): Promise<AllJobsResponse> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/jobs`, {
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }

    return response.json();
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
    const response = await fetch(`${getApiBaseUrl()}/infer/image`, {
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
  const response = await fetch(`${getApiBaseUrl()}/jobs/${jobId}`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobResults(jobId: string): Promise<JobResult> {
  const response = await fetch(`${getApiBaseUrl()}/jobs/${jobId}/results`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job results: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/jobs/${jobId}`, {
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
  // Build URL based on the API pattern: /v1/jobs/<job_id>/files/<type>/<filename>
  return `${API_HOST}/v1/jobs/${jobId}/files/${type}/${filename}`;
}

export function getOriginalImageUrl(jobId: string, filename: string): string {
  return `${API_HOST}/v1/jobs/${jobId}/files/input/${filename}`;
}
