const db = require('../../dbconfig');

const catchAsync = require('../../Utils/catchAsync');

exports.getAllCusters = catchAsync(async (req, res, next) => {
  const { isActive, orderby } = req.body;
  let filterQuery = '';
  if (isActive) {
    filterQuery = `WHERE azst_customer_status = ${isActive}`;
  }

  const getUsers = ` SELECT azst_customer_id,azst_customer_fname,azst_customer_lname,
                            azst_customer_mobile,azst_customer_email,azst_customer_acceptemail_marketing,
                            azst_customer_status,DATE_FORMAT(azst_customer_createdon , '%d-%m-%Y %H:%i:%s') as registered_on,
                            azst_customer_gender   
                        FROM azst_customer  ${filterQuery} Order BY azst_customer_createdon ${
    orderby ?? 'DESC'
  }`;
  const users = await db(getUsers);
  res.status(200).json(users);
});

// azst_customer_id,
//   azst_customer_fname,
//   azst_customer_lname,
//   azst_customer_mobile,
//   azst_customer_email,
//   azst_customer_pwd,
//   azst_customer_hno,
//   azst_customer_area,
//   azst_customer_city,
//   azst_customer_district,
//   azst_customer_state,
//   azst_customer_country,
//   azst_customer_zip,
//   azst_customer_landmark,
//   azst_customer_acceptemail_marketing,
//   azst_customer_company,
//   azst_customer_address1,
//   azst_customer_address2,
//   azst_customer_acceptsms_marketing,
//   azst_customer_totalspent,
//   azst_customer_totalorders,
//   azst_customer_note,
//   azst_customer_taxexempts,
//   azst_customer_tags,
//   azst_customer_status,
//   azst_customer_createdon,
//   azst_customer_updatedon,
//   azst_customer_gender,
//   azst_customer_DOB;