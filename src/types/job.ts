export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface JobObject {
  label: string;
  class_id: number;
  confidence: number;
  bbox: [number, number, number, number];
  crop: string;
  crop_rel: string;
  pred_label: string;
  pred_confidence: number;
}

export interface JobImage {
  image: string;
  image_rel: string;
  annotated: string;
  annotated_rel: string;
  objects: JobObject[];
}

export interface JobResult {
  job_id: string;
  status: JobStatus;
  total_images: number;
  images: JobImage[];
}

export interface Job {
  job_id: string;
  status: JobStatus;
  stage?: string;
  updated_at?: string;
  localImageUrl?: string;
  result?: JobResult;
}

export interface CreateJobResponse {
  job_id: string;
  status: JobStatus;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  stage?: string;
  updated_at?: string;
}
