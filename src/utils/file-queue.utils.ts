import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.config.js';
const connection= redisConnection.getConnection()

export const fileQueue = new Queue('file-processing-queue', {
  connection
});