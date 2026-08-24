const express = require('express');
const router=express.Router();
const multer = require('multer');
const path=require('path');
const { verifyToken } = require('../middlewares/verifyToken');



 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../images'));
    },
    filename: function (req, file, cb) {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
  });



const upload = multer({ storage: storage }); // create a multer instance with the defined storage configuration
// Set up multer for file uploads
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    url: `/images/${req.file.filename}`,
  });
});

const audioUpload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('audio/')),
});

router.post('/audio', verifyToken, audioUpload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a valid audio file (up to 12 MB).' });
  res.status(200).json({ url: `/images/${req.file.filename}` });
});

const allowedAttachmentTypes = new Set([
  'application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const attachmentUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/') || allowedAttachmentTypes.has(file.mimetype)),
});

router.post('/attachment', verifyToken, attachmentUpload.single('attachment'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Upload an image, PDF, document, spreadsheet, text file, or ZIP (up to 20 MB).' });
  res.status(200).json({
    url: `/images/${req.file.filename}`,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});








module.exports=router;
