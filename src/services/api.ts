import { CreateJobResponse, JobStatusResponse, JobResult } from '@/types/job';

const API_BASE_URL = 'http://95.253.220.115:62077/v1';

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

export function getImageUrl(path: string): string {
  // The path is already absolute from the API, just prepend the base
  return `http://95.253.220.115:62077${path}`;
}
