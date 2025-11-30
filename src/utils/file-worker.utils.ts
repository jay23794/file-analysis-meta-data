  import { Worker, Job } from "bullmq";
  import { redisConnection } from "../config/redis.config.js";
  import { exiftool } from "exiftool-vendored";
  import fs from "fs";
  import { PDFParse } from "pdf-parse";
  import Tesseract from "tesseract.js";
  import { ExifMetadata, ImageOcr, Analysis } from "../models/exif.model.js";
  import { fileQueue } from "../utils/file-queue.utils.js";
  import { isPdf, isImage } from "./utils.global.js";
  import type { IJobPayload } from "../types/exif.type.js";
  import axios from "axios";

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  export function startFileWorker() {
    const worker = new Worker(
      "file-processing-queue",
      async (job: Job) => {
        const jobPayload = job.data as IJobPayload;
       return  _runJobs(job.name, jobPayload);
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
  }

  async function _runJobs(jobName: string, jobpayload: IJobPayload) {
    switch (jobName) {
      case "scan":
        return await _performScanning(jobpayload);

      case "ocr":
        return await _performOCR(jobpayload);

      case "exif":
        await _performExif(jobpayload);
        return await fileQueue.add("imageOcr", jobpayload);

      case "imageOcr":
        return await _performImageToText(jobpayload);

      case "file-status":
        return await _fileProcessing(jobpayload);

      default:
        console.log("Unknown job");
    }
  }

  async function _performScanning(jobpayload: IJobPayload) {
    // Update file status
    await Analysis.updateOne(
      { _id: jobpayload.jobId },
      { $set: { status: "PROCESSING" } }
    );
    await sleep(5000);
    if (await isPdf(jobpayload.filePath)) {
     return  await fileQueue.add("ocr", jobpayload);
    }
    if (await isImage(jobpayload.filePath)) {
     return  await fileQueue.add("exif", jobpayload);
    }
  }

  async function _performOCR(jobpayload: IJobPayload) {
    try {
      const dataBuffer = fs.readFileSync(jobpayload.filePath);
      const parser = new PDFParse({
        data: dataBuffer,
        verbosity: 1,
      });

      const text = await parser.getText();
      await ImageOcr.insertOne({
        jobId: jobpayload.jobId,
        fileName: jobpayload.originalName,
        text,
      });
      await fileQueue.add("file-status", jobpayload);
    } catch (error) {
      await Analysis.updateOne(
        { _id: jobpayload.jobId },
        { $set: { status: "FAILED" } }
      );
    }
  }

  async function _performExif(jobpayload: IJobPayload) {
    try {
      const tags = await exiftool.read(jobpayload.filePath);
      await ExifMetadata.insertOne({
        exif: tags,
        jobId: jobpayload.jobId,
        fileName: jobpayload.originalName,
      });
    } catch (error) {
      await ExifMetadata.insertOne({
        exif: error,
        fileName: jobpayload.originalName,
      });
    }
  }

  async function _performImageToText(jobpayload: IJobPayload) {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(jobpayload.filePath, "eng");
      await ImageOcr.insertOne({
        jobId: jobpayload.jobId,
        fileName: jobpayload.originalName,
        text,
      });

      // File processing Complete
      await fileQueue.add("file-status", jobpayload);
    } catch (error) {
      await Analysis.updateOne(
        { _id: jobpayload.jobId },
        { $set: { status: "FAILED" } }
      );
    }
  }

  async function _fileProcessing(jobpayload: IJobPayload) {
    try {
      await Analysis.updateOne(
        { _id: jobpayload.jobId },
        { $set: { status: "COMPLETED" } }
      );
      await axios.post("http://localhost:9000/api/v1/file/webhook", {
        success: true,
        error: "",
        data: { lastJobName: "", jobpayload },
      });
    } catch (error) {
    
      await Analysis.updateOne(
        { _id: jobpayload.jobId },
        { $set: { status: "FAILED" } }
      );
      await axios.post("http://localhost:9000/api/v1/file/webhook", {
        success: false,
        error,
        data: { lastJobName: "", jobpayload },
      });
    }
  }
