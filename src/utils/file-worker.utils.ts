import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.config.js";
import { exiftool } from "exiftool-vendored";
import fs from "fs";
import { PDFParse, } from "pdf-parse";
import Tesseract from "tesseract.js";
import { ExifMetadata, ImageOcr, Analysis } from "../models/exif.model.js";
import { fileQueue } from "../utils/file-queue.utils.js";
import type { file } from "zod";
import { isPdf, isImage } from "./utils.global.js";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export function startFileWorker() {
    const worker = new Worker(
        "file-processing-queue",
        async (job: Job) => {
            const { filePath,extension, originalName, jobId } = job.data;
            _runJobs(job.name, filePath, originalName, jobId,extension)
        },
        {
            connection: redisConnection.getConnection(),
        }
    );

    worker.on("completed", (job) => {
        console.log(` Job ${job.name} completed, Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.log(` Job ${job?.name} completed, Job ${job?.id} completed`, err);
    });

    console.log("------File Worker started----");
}


async function _runJobs(name: string, filePath: string, originalName: string, nJobId: string,extension:string) {
    switch (name) {

        case "scan":
            return await _performScanning(filePath, originalName, nJobId,extension);

        case "ocr":
            return await _performOCR(filePath, originalName, nJobId,extension);

        case "exif":
            await _performExif(filePath, originalName, nJobId,extension);
            return await fileQueue.add("imageOcr", { filePath, originalName, jobId: nJobId,extension });

        case "imageOcr":
            console.log("nJob:" + nJobId)
            return await _performImageToText(filePath, originalName, nJobId);

        default:
            console.log("Unknown job");
    }
}

async function _performScanning(filePath: string, originalName: string, nJobId: string,extension:string) {
     // Update file status
     await Analysis.updateOne({ _id: nJobId }, { $set: { status: "PROCESSING" } });
    await sleep(5000)
    if (await isPdf(filePath)) {
        await fileQueue.add("ocr", {
            filePath,
            extension,
            originalName,
            jobId: nJobId
        });
    }
    if (await isImage(filePath)) {
        await fileQueue.add("exif", {
            filePath: filePath,
            extension,
            originalName,
            jobId:nJobId
        });
    }
}

async function _performOCR(filePath: string, fileName: string, nJobId: string,extension:string) {
    try {
       

        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({
            data: dataBuffer,
            verbosity: 1,
        })

        const text = await parser.getText();
        await ImageOcr.insertOne({
            jobId: nJobId,
            fileName,
            text,
        });
        await Analysis.updateOne({ _id: nJobId }, { $set: { status: "COMPLETED" } });
    } catch (error) {
        await Analysis.updateOne({ _id: nJobId }, { $set: { status: "FAILED" } });

    }
}

async function _performExif(filePath: string, fileName: string, nJobId: string,extension:string) {
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

async function _performImageToText(filePath: string, fileName: string, nJobId: string) {
    try {
        const {
            data: { text },
        } = await Tesseract.recognize(filePath, "eng");
        await ImageOcr.insertOne({
            jobId: nJobId,
            fileName,
            text,
        });
        await Analysis.updateOne({ _id: nJobId }, { $set: { status: "COMPLETED" } });


    } catch (error) {
        await Analysis.updateOne({ _id: nJobId }, { $set: { status: "FAILED" } });

    }
}