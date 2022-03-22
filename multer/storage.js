import multer from "multer";

const FILE_TYPE_MAP = {
  // mime type
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./subidas");
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.replace(" ", "-");
    const extension = filename.substring(filename.lastIndexOf('.')+1);
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

export default storage;