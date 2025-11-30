# File Processing System

A robust file processing system built with Node.js and BullMQ for handling asynchronous file operations.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm 

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jay23794/file-analysis-meta-data.git
   cd file-analysis-meta-data
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=9000
   LOCALHOST=http://localhost:9000/
   NODE_ENV=development
   
   
   # Database
   DATABASE_URL="mongodb://localhost:27017/file-upload"
   
   # Redis
   host= 127.0.0.1
   redis_port= 6379
 
   ```
4. **Start Redis using Docker**
   ```bash
   docker run -d -p 6379:6379 --name redis redis:latest
   ```
   
   To verify Redis is running:
   ```bash
   docker ps
   ```
   
   To stop Redis:
   ```bash
   docker stop redis
   ```
   
   To start Redis again:
   ```bash
   docker start redis
   ```

## Run

### Development Mode

Start the application with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:9000` and the worker will begin processing queued jobs automatically.

### Production Mode

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the application:
   ```bash
   npm start
   ```
### Application Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

