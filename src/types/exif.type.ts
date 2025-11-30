export interface IExif  {
  jobId: string;
  fileName: string;
  exif: object;
  
}

export interface IImageOCR  {
  jobId: string;
  fileName: string;
  text: object;
}

export interface IAnalysis  {
  id?: string;
  fileName: string;
  extension: string;
  status:string;
}

export interface IJobPayload  {
  jobId: string;
  jobName: string;
  filePath: string;
  extension: string;
  originalName:string;
}

export interface IJobStatus  {
  success:boolean
  jobId: string;
  lastJobName: string;
  error: object;
  extension: string;
  originalName:string;
}
