const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Reject executables and scripts
  const blockList = ['.exe', '.sh', '.bat', '.cmd', '.ps1', '.msi', '.bin'];
  const ext = file.originalname.slice((file.originalname.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  
  if (blockList.includes(`.${ext}`)) {
    return cb(new Error('Executable files are not allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: fileFilter
});

const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 5);

module.exports = {
  uploadSingle,
  uploadMultiple
};
