import * as mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

export class MongoDbConnection {
  async connectDB() {
    try {
      const mongoURI = process.env.DATABASE_URL || "";
      console.log(mongoURI)
      await mongoose.connect(mongoURI, {});
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}
export const mongoConnection = new MongoDbConnection();
