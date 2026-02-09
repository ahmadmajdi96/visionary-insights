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
  shelf_index?: number;
  index_in_shelf?: number;
}

export interface ShelfInfo {
  shelf_index: number;
  y_center_min: number;
  y_center_max: number;
  total_objects: number;
  known_count: number;
  unknown_count: number;
  class_counts: Record<string, number>;
  classes_left_to_right: string[];
}

export interface ShelvesData {
  shelves: ShelfInfo[];
  total_known: number;
  total_unknown: number;
  total_objects: number;
}

export interface PlanogramData {
  planogram: string[][];
}

export interface ComplianceData {
  match_score: number;
  match_percent: number;
  total_expected: number;
  total_matched: number;
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
