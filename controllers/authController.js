//const {promisify} = require('util');
const db = require('../dbconfig');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const createSendToken = require('../Utils/jwtToken');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 1) Getting Token and Check the Token IS valid OR NOT
  if (!token) {
    return next(
      new AppError('you are not logged in! Please login to get access.', 401)
    );
  }

  // 2) check if user is exist
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return next(
        new AppError(
          'The User could beloonging to this token does no longer exist. Login Again',
          401
        )
      );
    }

    req.empId = payload.id;
    next();
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const getoldPassword =
    'SELECT azst_customer_pwd FROM azst_customer WHERE azst_customer_id= ?';
  const queryAsync = promisify(db.query).bind(db);
  const result = await queryAsync(getoldPassword, [req.empId]);

  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    result[0].azst_customer_pwd
  );

  if (result[0].length === 0 || !isPasswordMatched) {
    return next(new AppError('Invalid CurrentPassword', 404));
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const changePasswordAfterReset = `UPDATE azst_customer SET azst_customer_pwd = ? WHERE azst_customer_id = ?`;
  await queryAsync(changePasswordAfterReset, [hashedPassword, req.empId]);
  const token = createSendToken(req.empId);
  res.status(200).json({ jwtToken: token });
});

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   //1) get user based on email address

//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new AppError('There is no user with that email address', 404));
//   }

//   // 2) generate the random reset token

//   const resetToken = user.createPasswordRestToken();

//   await user.save({ validateBeforeSave: false });

//   // 3) send it to the uset email address

//   try {
//     const resetUrl = `${req.get('origin')}/forgotpass/${resetToken}`;

//     await new Email(user, resetUrl).sendPasswordReset();
//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to your email address',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError(
//         'There was an error sending the email. Try again later!',
//         500
//       )
//     );
//   }
// });

// exports.updatepassword = catchAsync(async (req, res, next) => {
//   // 1) get user form collection
//   //console.log(req.user.id,req.body.passwordCurrent,req.body.password,req.body.passwordConfirm)
//   const user = await User.findById(req.user.id).select('+password');
//   //2) check if posted paasword correct
//   const correctPassword = await user.correctPassword(
//     req.body.passwordCurrent,
//     user.password
//   );

//   if (!user || !correctPassword) {
//     return next(
//       new AppError(
//         'Your Current password is wrong ,Enter Correct Password',
//         401
//       )
//     );
//   }
//   // 3) corect update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();

//   // 4)// Login user and send token to user
//   createSendToken(user, 200, req, res);
// });

// exports.isLoggedIn = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next();
//     }
//     if (currentUser.changePasswordAfter(decoded.iat)) {
//       return next();
//     }

//     res.locals.user = currentUser;
//     return next();
//   }

//   next();
// });

// exports.restricTo = (...roles) => {
//   return (req, res, next) => {
//     // roles ['admin','lead-guide]. role= 'user
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You not have permission to perform this action', 403)
//       );
//     }
//     next();
//   };
// };
// exports.logout = (req, res) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: 'success' });
// };
