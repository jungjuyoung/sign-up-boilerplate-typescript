import mongoose, { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface IUser {
  name: string;
  email: string;
  password: string;
  lastname: string;
  role: number;
  token: string;
  tokenExp: number;
}

export interface IUserModel extends Document, IUser {
  comparePassword(
    password: string,
    callback: (err: Error | null, isMatch: boolean | null) => void,
  ): void;
  generateToken(err: Error | null, user: IUser): void;
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

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    // 비밀번호를 변경하는것이 아니면 바로 return시켜 종료.
    return next();
  }

  // 비밀번호를 암호화한다.
  const salt = await bcrypt.genSalt(config.get<number>('saltRound'));
  // salt 생성.
  const hash = await bcrypt.hashSync(user.password, salt); // hash화.

  console.log(`salt: ${salt}, hash: ${hash}`);
  user.password = hash;
  return next();
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPasswrd: 1234567, db에 암호화된 비밀번호를 비교.
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  // jsonwebtoken을 이용해서 token 생성하기
  let user = this;
  console.log(`methods generateToken user: ${user}`);

  const token = jwt.sign(user._id, 'secretToken');
  user.token = token;
  user.save((err: Error | null, user: IUser) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

const UserModel = mongoose.model<IUserModel>('User', userSchema);
export default UserModel;
