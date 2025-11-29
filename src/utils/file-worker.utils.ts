import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.config.js";
import { exiftool } from "exiftool-vendored";
import fs from "fs";
import { PDFParse, type TextResult } from "pdf-parse";
import Tesseract from "tesseract.js";
import { ExifMetadata, ImageOcr } from "../models/exif.model.js";
import { fileQueue } from "../utils/file-queue.utils.js";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export function startFileWorker() {
    const worker = new Worker(
        "file-processing-queue",
        async (job: Job) => {
            const { filePath, originalName,jobId } = job.data;
            _runJobs(job.name, filePath, originalName,jobId)
        },
        {
            connection: redisConnection.getConnection(),
        }
    );

    worker.on("completed", (job) => {
        console.log(` Job ${job.name} completed, Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
         console.log(` Job ${job?.name} completed, Job ${job?.id} completed`,err);
    });

    console.log("------File Worker started----");
}

async function _performOCR(filePath: string, fileName: string,nJobId:string): Promise<TextResult> {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({
            data: dataBuffer,
            verbosity: 1,
        });
        return await parser.getText();
    } catch (error) {
        console.error("Error performing OCR:", error);
        throw error;
    }
}

async function _performExif(filePath: string, fileName: string,nJobId:string) {
    try {
        const tags = await exiftool.read(filePath);
        await ExifMetadata.insertOne({
            exif: tags,
            jobId: nJobId,
            fileName,
        });
    } catch (error) {
        await ExifMetadata.insertOne({
            exif: error,
            fileName,
        });
    }
}
async function _performImageToText(filePath: string, fileName: string,nJobId:string) {
    try {
        const {
            data: { text },
        } = await Tesseract.recognize(filePath, "eng");
        await ImageOcr.insertOne({
             jobId: nJobId,
            fileName,
            text,
        });
    } catch (error) {
        console.log(error)
     }
}
async function _runJobs(name: string, filePath: string, originalName: string,nJobId:string) {
    switch (name) {
        case "ocr":
            return await _performOCR(filePath,originalName,nJobId);

        case "exif":
            await _performExif(filePath, originalName,nJobId);
            return await fileQueue.add("imageOcr", { filePath, originalName,jobId:nJobId });

        case "imageOcr":
            console.log("nJob:"+nJobId)
            return await _performImageToText(filePath, originalName,nJobId);

        default:
            console.log("Unknown job");
    }
}

