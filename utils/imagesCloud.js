const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadeProfileImage = async (req, res, next) => {
  console.log(req.files.image);
  // console.log(req.files,im);
  if (!req.files.image) {
    console.log('no images');
    return next();
  }
  const ext = req.files.image.mimetype.split('/')[1];
  const imageName = `user--${Date.now()}.${ext}`;
  console.log(imageName);
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      resource_type: 'auto',
      public_id: `${imageName}`,
    }
  );
  console.log(result);
  req.body.image = result.secure_url;
  next();
};
exports.uploadeImageCover = async (req, res, next) => {
  if (!req.files.imageCover) {
    res.status(200).json({ status: 'no image Cover' });
    return next();
  }
  console.log(req.files.imageCover);
  // console.log(req.files,im);
  const ext = req.files.imageCover.mimetype.split('/')[1];
  const imageName = `imageCover--${Date.now()}.${ext}`;
  console.log(imageName);
  const result = await cloudinary.uploader.upload(
    req.files.imageCover.tempFilePath,
    {
      resource_type: 'auto',
      public_id: `${imageName}`,
    }
  );
  console.log(result);
  req.body.imageCover = result.secure_url;
  // res.status(200).json(result);
  next();
};
