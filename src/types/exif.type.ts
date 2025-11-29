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