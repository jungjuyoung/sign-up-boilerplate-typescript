import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import { NextFunction } from 'express';

const saltRounds = 10;
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  lastname: string;
  role: number;
  token: string;
  tokenExp: number;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 40,
  },
  role: {
    type: Number,
    defautl: 0,
  },
  image: String,
  token: { type: String },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre('save', function (next) {
  let user = this;
  console.log('@@@', this);

  if (user.isModified('password')) {
    // 비밀번호를 암호화한다.
    bcrypt.genSalt(saltRounds, (err: any, salt: string) => {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, (err, hash: string) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  }
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
