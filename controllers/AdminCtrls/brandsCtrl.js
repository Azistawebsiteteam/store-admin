const moment = require('moment');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const db = require('../../dbconfig');

const AppError = require('../../Utils/appError');
const catchAsync = require('../../Utils/catchAsync');

exports.isBrandExit = catchAsync(async (req, res, next) => {
  const { brandId } = req.body;

  const getbrand = `SELECT * FROM azst_brands_tbl WHERE  azst_brands_id = ${brandId} AND status = 1`;

  db.query(getbrand, (err, brand) => {
    if (err) return next(new AppError(err.sqlMessage, 400));
    if (brand.length === 0) return next(new AppError('No brand found', 404));
    req.brand = brand[0];
    next();
  });
});

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

exports.uploadImage = upload.single('brandLogo');

exports.storeImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Upload brand image is required', 400));
  }

  const imageName = `${Date.now()}-${req.file.originalname}`;
  await sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`Uploads/brandlogos/${imageName}`);

  req.body.image = imageName;
  next();
});

exports.updateImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    req.body.image = '';
    return next();
  }
  const imagePath = `Uploads/brandlogos/${req.brand.azst_brand_logo}`;
  fs.unlink(imagePath, (err) => {
    if (err) return next(new AppError('Error in Update Logo', 400));
  });
  const imageName = `${Date.now()}-${req.file.originalname}`;
  await sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`Uploads/brandlogos/${imageName}`);

  req.body.image = imageName;
  next();
});

const modifyBrandData = (req, brand) => ({
  azst_brands_id: brand.azst_brands_id,
  azst_brand_name: brand.azst_brand_name,
  azst_brand_logo: `${req.protocol}://${req.get('host')}/brand/logs/${
    brand.azst_brand_logo
  }`,
});

exports.getbrands = catchAsync(async (req, res, next) => {
  const brandsQuery = `SELECT azst_brands_id,azst_brand_name,azst_brand_logo
                        FROM azst_brands_tbl WHERE status = 1`;

  db.query(brandsQuery, (err, result) => {
    if (err) return next(new AppError(err.sqlMessage, 400));
    const brands = result.map((brand) => modifyBrandData(req, brand));
    res.status(200).json(brands);
  });
});

exports.getbrand = catchAsync(async (req, res, next) => {
  const brand = modifyBrandData(req, req.brand);
  res.status(200).json(brand);
});

exports.addBrnad = catchAsync(async (req, res, next) => {
  const { brandName, image } = req.body;

  if (!brandName) return next(new AppError('Brand Name Required', 400));

  const today = moment().format('YYYY-MM-DD HH:mm:ss');

  const imnsertQuery =
    'INSERT INTO  azst_brands_tbl (azst_brand_name,azst_brand_logo,createdon,updatedby) VALUES (?,?,?,?)';

  const values = [brandName, image, today, req.empId];

  db.query(imnsertQuery, values, (err, result) => {
    if (err) return next(new AppError(err.sqlMessage, 400));
    res.status(200).json({ azst_brands_id: result.insertId });
  });
});

exports.updateBrand = catchAsync(async (req, res, next) => {
  const { brandId, brandName, image } = req.body;

  if (!brandName) return next(new AppError('Brand Name Required', 400));

  let updateQuery =
    'UPDATE azst_brands_tbl SET azst_brand_name=?, azst_brand_logo =? ,updatedby=? where azst_brands_id =? ';
  let values = [brandName, image, req.empId, brandId];

  if (image === '') {
    updateQuery =
      'UPDATE azst_brands_tbl SET azst_brand_name=? ,updatedby=? where azst_brands_id =? ';
    values = [brandName, req.empId, brandId];
  }

  db.query(updateQuery, values, (err, result) => {
    if (err) return next(new AppError(err.sqlMessage, 400));
    res.status(200).json({ message: 'Updated brand ' + brandName });
  });
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.body;
  const deletecollection =
    'UPDATE azst_brands_tbl SET status = 0, updatedby=? where azst_brands_id = ? ';
  const values = [req.empId, brandId];

  db.query(deletecollection, values, (err, result) => {
    if (err) return next(new AppError(err.sqlMessage, 400));
    res.status(200).json({ message: 'brand deleted Successfully ' });
  });
});
