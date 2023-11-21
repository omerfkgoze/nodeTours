import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

//* payload, secret, and options
const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// CREATE A USER
const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // CREATE A TOKEN
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
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
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) GET TOKEN AND CHECK IF IT EXISTS

  // 2) VERIFY TOKEN

  // 3) CHECK IF USER STILL EXISTS

  // 4) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  next();
});

export { signup, login, protect };
