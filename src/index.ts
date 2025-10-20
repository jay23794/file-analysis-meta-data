import express  from "express";
import type  { Request, Response }  from "express";
import {mongoConnection} from './config/db.config.js'
import userRoutes from './routes/user.route.js'
import * as dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoConnection.connectDB();


app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});