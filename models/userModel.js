import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name.'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password.'],
    minlength: 8,
    // select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a password confirm.'],
    validate: {
      // this only works on CREATE and SAVE!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same.',
    },
  },
});
