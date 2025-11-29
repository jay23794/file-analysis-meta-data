import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.config.js'
import { exiftool } from "exiftool-vendored";
import fs from "fs";
import { PDFParse, type TextResult } from "pdf-parse";

import { ExifMetadata } from "../models/exif.model.js"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export function startFileWorker() {
    const worker = new Worker(
        'file-processing-queue',
        async (job: Job) => {
            const { filePath, originalName, extension } = job.data;
            //await sleep(2000);
            if (extension === 'pdf') {
                await _performOCR(filePath)
                return;
            }

            // Perform EXIF
            await _performExif(filePath, originalName)

            // if (job.name === 'ocrs') {
            //     const { data: { text } } = await Tesseract.recognize(filePath, "eng");
            //     console.log(text);
            //     console.log(job.data)

            //     const tags = await exiftool.read(filePath);
            //     console.log(`Camera: ${tags.Make} ${tags.Model}`);
            //     console.log(`Taken: ${tags.DateTimeOriginal}`);
            //     console.log(`Size: ${tags.ImageWidth}x${tags.ImageHeight}`);
            //     // const clamscan = await new NodeClam().init({
            //     //     removeInfected: true,
            //     //     scanLog: "logs/scan.log",
            //     // });

            //     // const result = await clamscan.scanFile(filePath);
            //     // console.log(result);


            //     console.log('📦 Processing file:', originalName);
            //     console.log('✅ File processed:', filePath);
            //     return { status: 'done', file: originalName };
            // }

        },
        {
            connection: redisConnection.getConnection(),
        }
    );


    worker.on('completed', job => {
        console.log(`✅ Job ${job.id} completed`);
    });


    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed:`, err);
    });


    console.log('🚀 File Worker started');
}




async function _performOCR(filePath: string): Promise<TextResult> {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({
            data: dataBuffer,
            verbosity: 1,

        });
        return await parser.getText()

    } catch (error) {
        console.error("Error performing OCR:", error);
        throw error;
    }
}

async function _performExif(filePath: any, fileName: String) {
    const tags = await exiftool.read(filePath);
    await ExifMetadata.insertOne({
        exif: tags,
        fileName
    })

}
