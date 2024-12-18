const db = require('../../Database/dbconfig');
const moment = require('moment');

const AppError = require('../../Utils/appError');
const catchAsync = require('../../Utils/catchAsync');
const organizCustomerData = require('./datafunctions');

exports.isUserExist = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  // userId is required came when Admin request to get user Details
  const id = userId ?? req.empId;

  const getUser =
    'Select *  from azst_customers_tbl where azst_customer_id  = ? AND azst_customer_status = 1';
  const [user] = await db(getUser, [id]);
  if (!user) return next(new AppError('No such customer was found', 404));
  req.userDetails = user;
  next();
});

exports.getCustomer = catchAsync(async (req, res, next) => {
  const customerData = organizCustomerData(req.userDetails);
  res.status(200).json(customerData);
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    mobileNum,
    email,
    acceeptEmailMarketing,
    marketingSmsAccept,
    taxExempts,
    gender,
    dob,
  } = req.body;

  const query = `UPDATE azst_customers_tbl SET  azst_customer_fname = ?, azst_customer_lname = ?, 
                        azst_customer_mobile = ?, azst_customer_email = ?, azst_customer_acceptemail_marketing = ?,
                        azst_customer_acceptsms_marketing = ?,azst_customer_taxexempts = ?,
                        azst_customer_updatedon  = ?,azst_customer_gender = ?, azst_customer_DOB = ?
                    WHERE azst_customer_id  = ?`;

  const today = moment().format('YYYY-MM-DD HH:mm:ss');

  const values = [
    firstName,
    lastName,
    mobileNum,
    email.toLowerCase(),
    acceeptEmailMarketing,
    marketingSmsAccept,
    taxExempts,
    today,
    gender,
    dob,
    req.empId,
  ];

  await db(query, values);

  res.status(200).send({ message: 'Profile updated successfully' });
});

exports.updateBillingAddress = catchAsync(async (req, res, next) => {
  const {
    houseNumber,
    district,
    state,
    country,
    zipCode,
    landmark,
    company,
    address1,
    address2,
  } = req.body;

  const query = `UPDATE azst_customers_tbl SET   azst_customer_hno = ?,
                        azst_customer_district = ?,azst_customer_state = ?, azst_customer_country = ?,
                        azst_customer_zip = ?,azst_customer_landmark = ?, azst_customer_company = ?,
                        azst_customer_address1 = ?, azst_customer_address2 = ?,azst_customer_updatedon  = ?
                    WHERE azst_customer_id  = ?`;

  const today = moment().format('YYYY-MM-DD HH:mm:ss');

  const values = [
    houseNumber,
    district,
    state,
    country,
    zipCode,
    landmark,
    company,
    address1,
    address2,
    today,
    req.empId,
  ];
  await db(query, values);

  res.status(200).send({ message: 'Billing Address updated successfully' });
});
