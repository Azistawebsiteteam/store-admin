const moment = require('moment');
const multer = require('multer');
const sharp = require('sharp');
const Joi = require('joi');
const fs = require('fs').promises; // Import the promises-based version of the fs module

const db = require('../../dbconfig');
const catchAsync = require('../../Utils/catchAsync');
const AppError = require('../../Utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('file is Not an Image! please upload only image', 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadbanner = upload.fields([
  { name: 'webBanner', maxCount: 1 },
  { name: 'mobileBanner', maxCount: 1 },
]);

const bannerSchema = Joi.object({
  title: Joi.string().min(3).allow(''),
  description: Joi.string().min(3).allow(''),
  altText: Joi.string().min(3).allow(''),
  webBanner: Joi.string().min(3).allow(''),
  mobileBanner: Joi.string().min(3).allow(''),
  backgroundUrl: Joi.string().min(3).allow(''),
  startTime: Joi.string().allow(''),
  endTime: Joi.string().allow(''),
  isDefault: Joi.string().required().valid('0', '1'),
  bannerId: Joi.number().optional(),
});

const updateBannerSchema = bannerSchema.keys({
  bannerId: Joi.number().required(),
});

const uploadBannerImage = async (files) => {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const images = {};
  const promises = [];

  for (const fieldName in files) {
    const imageField = files[fieldName][0];

    // Check the file type
    if (!allowedMimeTypes.includes(imageField.mimetype)) {
      throw new AppError(
        'Invalid file type. Only PNG, JPEG, and JPG are allowed.',
        400
      );
    }

    const imageName = `${Date.now()}-${imageField.originalname.replace(
      / /g,
      '-'
    )}`;
    const folder = `uploads/bannerImages/`; // Corrected folder path

    // Process image and save it
    promises.push(
      sharp(imageField.buffer)
        .toFile(`${folder}${imageName}`)
        .then(() => {
          images[fieldName] = imageName;
        })
    );
  }

  await Promise.all(promises);
  return images;
};

exports.storebanner = catchAsync(async (req, res, next) => {
  const { error } = bannerSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));

  if (!req.files || Object.keys(req.files).length < 2) {
    return next(new AppError('banner image is required', 400));
  }

  const images = await uploadBannerImage(req.files);
  Object.keys(images).forEach((image) => {
    req.body[image] = images[image];
  });
  next();
});

exports.updatestorebanner = catchAsync(async (req, res, next) => {
  const { error } = updateBannerSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));

  if (!req.files || Object.keys(req.files).length < 2) {
    return next();
  }
  const { azst_web_image, azst_mobile_image } = req.banner;
  for (const fieldName in req.files) {
    const imagePath =
      fieldName === 'webBanner'
        ? `uploads/bannerImages/${azst_web_image}`
        : `uploads/bannerImages/${azst_mobile_image}`;

    fs.unlink(imagePath, (err) => {});
  }
  const images = await uploadBannerImage(req.files);
  Object.keys(images).forEach((image) => {
    req.body[image] = images[image];
  });
  next();
});

const getBannerImageLink = (req, img) =>
  `${req.protocol}://${req.get('host')}/banners/${img}`;

exports.getbanners = catchAsync(async (req, res, next) => {
  const date = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = `SELECT banner_id,azst_web_image,azst_mobile_image,azst_background_url
                 FROM azst_banners_tbl WHERE status = 1 AND 
                  '${date}' >= azst_start_time AND '${date}' <= azst_end_time
                 ORDER BY azst_createdon DESC`;

  const defaultsQuery = `SELECT banner_id,azst_web_image,azst_mobile_image,azst_background_url
                         FROM azst_banners_tbl WHERE status = 1 AND is_default = 1 ORDER BY azst_createdon DESC`;

  let result = await db(query);
  if (result.length === 0) {
    result = await db(defaultsQuery);
  }

  const banners = result.map((b) => ({
    ...b,
    azst_web_image: getBannerImageLink(req, b.azst_web_image),
    azst_mobile_image: getBannerImageLink(req, b.azst_mobile_image),
  }));
  res.status(200).json(banners);
});

exports.getAllBanners = catchAsync(async (req, res, next) => {
  const defaultsQuery = `SELECT banner_id,azst_banner_title,azst_banner_description,
                            azst_web_image,azst_alt_text,azst_background_url,
                           DATE_FORMAT(azst_start_time, '%d-%m-%Y %H:%i:%s') as start_date,
                            DATE_FORMAT( azst_end_time, '%d-%m-%Y %H:%i:%s') as end_date,
                            status,is_default
                          FROM azst_banners_tbl  ORDER BY azst_createdon DESC`;

  let result = await db(defaultsQuery);
  if (result.length === 0) {
    return next(new AppError('No banner found', 404));
  }
  const banners = result.map((b) => ({
    ...b,
    azst_web_image: getBannerImageLink(req, b.azst_web_image),
    azst_mobile_image: getBannerImageLink(req, b.azst_mobile_image),
  }));
  res.status(200).json(banners);
});

exports.addBanner = catchAsync(async (req, res, next) => {
  let {
    title,
    description,
    altText,
    webBanner,
    mobileBanner,
    backgroundUrl,
    startTime,
    endTime,
    isDefault,
  } = req.body;

  const rowquery = `SELECT COUNT(*) as row_count FROM azst_banners_tbl`;

  const resultRows = await db(rowquery);
  if (resultRows[0].row_count > 20)
    return next(new AppError('maximum banner count exceeded.', 400));

  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  startTime = startTime === '' ? today : startTime;
  endTime =
    endTime === ''
      ? moment().add(10, 'months').format('YYYY-MM-DD HH:mm:ss')
      : endTime;

  const query = `INSERT INTO azst_banners_tbl (azst_banner_title, azst_banner_description, azst_web_image, azst_mobile_image, azst_alt_text, azst_background_url,
                        azst_start_time, azst_end_time, is_default, azst_updatedby, azst_createdby) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    title,
    description,
    webBanner,
    mobileBanner,
    altText,
    backgroundUrl,
    startTime,
    endTime,
    isDefault,
    req.empId,
    req.empId,
  ];

  const result = await db(query, values);

  res
    .status(200)
    .send({ banner_id: result.insertId, message: 'banner added successfully' });
});

exports.isBannerExist = catchAsync(async (req, res, next) => {
  const { bannerId } = req.body;
  if (!bannerId) return next(new AppError('banner Id required', 400));
  const query = `SELECT *
                 FROM azst_banners_tbl WHERE status = 1 AND banner_id = ? `;
  const result = await db(query, [bannerId]);
  if (result.length <= 0) return next(new AppError('banner not found', 404));
  req.banner = result[0];
  next();
});

exports.updateBanner = catchAsync(async (req, res, next) => {
  let {
    title,
    description,
    altText,
    webBanner,
    mobileBanner,
    backgroundUrl,
    startTime,
    endTime,
    isDefault,
    bannerId,
  } = req.body;

  const today = moment().format('YYYY-MM-DD HH:mm:ss');
  startTime = startTime === '' ? today : startTime;
  endTime =
    endTime === ''
      ? moment().add(10, 'months').format('YYYY-MM-DD HH:mm:ss')
      : endTime;

  webBanner = webBanner.substring(webBanner.lastIndexOf('/') + 1);
  mobileBanner = mobileBanner.substring(mobileBanner.lastIndexOf('/') + 1);
  // Find the last '/' to get the start index of the filename
  // Extract the filename from the URL

  const query = `
    UPDATE azst_banners_tbl
    SET
        azst_banner_title = ?,
        azst_banner_description = ?,
        azst_web_image = ?,
        azst_mobile_image = ?,
        azst_alt_text = ?,
        azst_background_url = ?,
        azst_start_time = ?,
        azst_end_time = ?,
        is_default = ?,
        azst_updatedby = ?
      
    WHERE
        banner_id = ?
`;

  const values = [
    title,
    description,
    webBanner,
    mobileBanner,
    altText,
    backgroundUrl,
    moment(startTime).format('YYYY-MM-DD HH:mm:ss'),
    moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
    isDefault,
    req.empId,
    bannerId,
  ];

  await db(query, values);

  res.status(200).send({ message: 'banner  details updated successfully' });
});

exports.getbanner = catchAsync(async (req, res, next) => {
  const banner_details = {
    ...req.banner,
    azst_web_image: getBannerImageLink(req, req.banner.azst_web_image),
    azst_mobile_image: getBannerImageLink(req, req.banner.azst_mobile_image),
  };
  res.status(200).json({ banner_details, message: 'banner details received' });
});

exports.hideBanner = catchAsync(async (req, res, next) => {
  const { bannerId, isHide } = req.body;

  const { error } = Joi.object({
    isHide: Joi.boolean(),
  }).validate({ isHide });

  if (error) return next(new AppError(error.message, 400));
  const status = isHide ? 0 : 1;
  const query = `UPDATE azst_banners_tbl SET status=${status} WHERE banner_id=${bannerId}`;
  await db(query);
  res.status(200).send({ message: 'Banner visibility updated successfully.' });
});

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const { bannerId } = req.body;

  const query = 'DELETE FROM azst_banners_tbl WHERE banner_id = ?';
  await db(query, [bannerId]);

  // Use path.join for handling file paths in a platform-independent way
  const webImagePath = `uploads/bannerImages/${req.banner.azst_web_image}`;
  const moImagePath = `uploads/bannerImages/${req.banner.azst_mobile_image}`;

  // Use fs.unlink instead of fs.unlinkSync for asynchronous file deletion
  await fs.unlink(webImagePath).catch((err) => {});
  await fs.unlink(moImagePath).catch((err) => {});

  res.status(200).send({ message: 'Banner deleted successfully.' });
});
