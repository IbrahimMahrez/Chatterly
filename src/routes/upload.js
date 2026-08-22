const express = require('express');
const router=express.Router();
const multer = require('multer');
const path=require('path');



 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../images'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // specify the filename for the uploaded file
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








module.exports=router;