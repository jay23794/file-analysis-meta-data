import multer from 'multer';
import path from "path";

export function fileUploadConfig(): multer.Multer {
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});
return multer({ storage,limits: { fileSize: 5 * 1024 * 1024 },  });
}