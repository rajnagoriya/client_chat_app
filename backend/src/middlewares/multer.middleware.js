// src/middleware/upload.js
import multer from "multer";
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Define separate regex for video, audio, images, and documents
  const videoTypes = /mp4|mov|avi|mkv/; // common video formats
  const audioTypes = /mp3|wav|m4a|ogg|webm|aac/; // added 'webm' and 'aac'
  const imageTypes = /jpeg|jpg|png|gif|webp|tiff/; // common image formats
  const documentTypes = /pdf|docx/; // common document formats

  const fileExt = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Check the file extension
  const isAllowed = [
    videoTypes,
    audioTypes,
    imageTypes,
    documentTypes
  ].some(type => type.test(fileExt.replace('.', '')));
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${fileExt} (${mimeType})`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;