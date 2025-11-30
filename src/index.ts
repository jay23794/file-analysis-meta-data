import express  from "express";
import type  { Request, Response }  from "express";
 import {mongoConnection} from './config/db.config.js'
import {redisConnection} from './config/redis.config.js'

import fileRoutes from './routes/file-upload.route.js'
import * as dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { startFileWorker } from './utils/file-worker.utils.js';
import cors from 'cors';
dotenv.config()
const app = express();

app.use(cors()); 

app.use(express.json());

const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoConnection.connectDB();

redisConnection.getConnection()
startFileWorker()

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});


app.use('/api/v1/file', fileRoutes);
// 404 handler - must be AFTER all routes
//app.use(notFound);

// Error handler - must be LAST
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});