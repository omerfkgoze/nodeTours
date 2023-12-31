import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

//* payload, secret, and options
const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (user, statusCode, res) {
  // CREATE A TOKEN
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// CREATE A USER
const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  // SEND TOKEN TO CLIENT
  createSendToken(newUser, 201, res);
});

// LOGIN A USER
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) CHECK IF USER EXISTS && PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password'); // select password because it is not selected by default

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) IF EVERYTHING IS OK, SEND TOKEN TO CLIENT
  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  // 1) GET TOKEN AND CHECK IF IT EXISTS
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) VERIFY TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );
  }

  // 4) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // set the user to the request object
  next();
});

const restrictTo = function (...roles) {
  return function (req, res, next) {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      // req.user is set in protect middleware
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }

    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // turn off all validators

  // 3) SEND IT TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // reset the passwordResetToken and passwordResetExpires
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // turn off all validators

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); // hash the token from the URL

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // check if the token has not expired
  });

  // 2) IF TOKEN HAS NOT EXPIRED, AND THERE IS USER, SET THE NEW PASSWORD
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password; // set the new password
  user.passwordConfirm = req.body.passwordConfirm; // set the new passwordConfirm
  user.passwordResetToken = undefined; // reset the passwordResetToken
  user.passwordResetExpires = undefined; // reset the passwordResetExpires

  await user.save(); // save the user

  // 3) UPDATE changedPasswordAt PROPERTY FOR THE USER
  // 4) LOG THE USER IN, SEND JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) GET USER FROM COLLECTION
  const user = await User.findById(req.user.id).select('+password');

  // 2) CHECK IF POSTED CURRENT PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) IF SO, UPDATE PASSWORD
  user.password = req.body.password; // set the new password
  user.passwordConfirm = req.body.passwordConfirm; // set the new passwordConfirm

  await user.save(); // save the user

  // 4) LOG USER IN, SEND JWT
  createSendToken(user, 200, res);
});

export {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
