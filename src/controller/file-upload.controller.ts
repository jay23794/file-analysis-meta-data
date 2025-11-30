import type { NextFunction, Request, Response } from "express";
import { fileQueue } from "../utils/file-queue.utils.js";
import { Analysis, ExifMetadata, ImageOcr, Summery } from "../models/exif.model.js";
import { fileExention } from "../utils/utils.global.js";
import type { IJobPayload } from "../types/exif.type.js";

export class FileUploadController {
    upload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({ error: "No file uploaded" });

            // Save file details
            const extension = await fileExention(file.path)
            const result = await Analysis.insertOne({ extension, fileName: file.originalname, status: "UPLOADED" })

            const job: IJobPayload = {
                extension,
                filePath: file.path,
                jobId: result.id,
                originalName: file.originalname,
                jobName: "scan"
            }


            await fileQueue.add("scan", job);


            return res.status(200).json({
                success: true,
                message: "File uploaded successfully"

            });
        } catch (error) {
            next(error);
        }
    }

    report = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const result = await Analysis.findOne({ '_id': id })
            if (!result) return res.status(400).json({ error: "File not found", success: false });

            if (result.status === "COMPLETED" || result.status === "FAILED") {
                if (result.extension === "pdf") {
                    const ocr = await ImageOcr.findOne({ 'jobId': result._id })
                    return res.status(200).json({
                        success: true,
                        data: {
                            ocr
                        }
                    });

                }

                const ocr = await ImageOcr.findOne({ 'jobId': result._id })
                const exif = await ExifMetadata.findOne({ 'jobId': result._id })
                return res.status(200).json({
                    success: true,
                    data: {
                        exif,
                        ocr
                    }
                });


            }
            return res.status(200).json({
                success: true,
                message: "File under processing. Please try in sometime"

            });
        } catch (error) {
            next(error);
        }
    }

    webhook = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const payload = req.body
            const jobDetail = payload?.data?.jobpayload as IJobPayload;
            if (!jobDetail || !jobDetail.jobId) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid payload",
                });
            }
           const result = await Analysis.findOne({ '_id': jobDetail.jobId });

            if (!result) return res.status(400).json({ error: "No file uploaded", success: false });


            await Summery.insertOne({
                error: payload.error || "",
                extension: jobDetail.extension,
                jobId: jobDetail.jobId,
                lastJobName: jobDetail.jobName || "",
                originalName: jobDetail.originalName,
                success: payload.success
            });
            if (payload.success) {
                return res.status(200).json({
                    success: true,
                    message: "File processing completed successfully",

                });
            }

            return res.status(400).json({
                success: false,
                message: "File processing incomplete",

            });


        } catch (error) {
            next(error);
        }
    }

    files = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await Analysis.find({})
            if (!result) return res.status(400).json({ error: "File(s) not found", success: false });
            return res.status(200).json({
                success: true,
                message: "File under processing. Please try in sometime",
                data: result
            });

        } catch (error) {
            next(error);
        }
    }
}



export const fileController = new FileUploadController();
