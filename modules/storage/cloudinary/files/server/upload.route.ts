import express from "express";
import multer from "multer";
import initCloudinary from "../../lib/cloudinary";

const router = express.Router();
const upload = multer({ dest: "/tmp/uploads" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const cloud = initCloudinary();
    if (!req.file) return res.status(400).send({ error: "No file" });
    const result = await cloud.uploader.upload(req.file.path, { folder: "uploads" });
    return res.send(result);
  } catch (err) {
    return res.status(500).send({ error: "Upload failed" });
  }
});

export default router;
