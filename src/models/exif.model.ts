import { model, Schema } from "mongoose";
import type { IExif } from "../types/exif.type.js";

const exifSchema = new Schema<IExif>(
  {
    fileName: { type: String, required: true },
    exif: { type: Object, required: true, },
  },
  { timestamps: true }
);

export const ExifMetadata = model<IExif>("exif", exifSchema);