const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image ,please choose an image', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// res.status(401).json({ status: '✨✨✨' });
exports.uploadUserImage = upload.single('image');
