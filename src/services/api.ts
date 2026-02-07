import { CreateJobResponse, JobStatusResponse, JobResult, Job } from '@/types/job';

// Use environment variable or default to the backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://95.253.220.115:62077/v1';
const API_HOST = import.meta.env.VITE_API_HOST || 'http://95.253.220.115:62077';

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
    const response = await fetch(`${API_BASE_URL}/jobs`, {
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
    const response = await fetch(`${API_BASE_URL}/infer/image`, {
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
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobResults(jobId: string): Promise<JobResult> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/results`, {
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`Failed to get job results: ${response.statusText}`);
  }

  return response.json();
}

export function getFilenameFromPath(path: string): string {
  // Extract filename from a path like /v1/jobs/xxx/files/annotated/image.jpg
  return path.split('/').pop() || path;
}

export function getImageUrl(jobId: string, type: 'annotated' | 'crop', filename: string): string {
  // Build URL based on the API pattern: /v1/jobs/<job_id>/files/<type>/<filename>
  return `${API_HOST}/v1/jobs/${jobId}/files/${type}/${filename}`;
}
