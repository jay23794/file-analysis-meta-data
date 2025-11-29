import { model, Schema } from "mongoose";
import type { IAnalysis, IExif, IImageOCR } from "../types/exif.type.js";



const exifSchema = new Schema<IExif>(
  {
    jobId:{ type: String, required: true },
    fileName: { type: String, required: true },
    exif: { type: Object, required: true, },
  },
  { timestamps: true }
);

const imageOcrSchema = new Schema<IImageOCR>(
  {
    jobId:{ type: String, required: true },
    fileName: { type: String, required: true },
    text: { type: Object, required: true, },
  },
  { timestamps: true }
);

const analysisSchema = new Schema<IAnalysis>(
  {
    fileName: { type: String, required: true },
    status: { type: String, required: true, },
    extension: { type: String, required: true, },
  },
  { timestamps: true }
);

export const Analysis = model<IAnalysis>("analysis", analysisSchema);
export const ExifMetadata = model<IExif>("exif", exifSchema);
export const ImageOcr = model<IImageOCR>("imageOcr", imageOcrSchema);