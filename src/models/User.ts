import mongoose, { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

export interface IUser {
  name: string;
  email: string;
  password: string;
  lastname: string;
  role: number;
  token: string;
  tokenExp: number;
  _id: string;
}
export interface IUserCallback extends IUser {
  comparePassword: (
    plainPassword: string,
    cb: (err: Error | null, isMatch: boolean | null) => void,
  ) => void;
  generateToken: (cd: (err: Error, user: IUser) => void) => void;
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
  // console.log('User모델 pre save');
  const user = this;

  if (!user.isModified('password')) {
    // 비밀번호를 변경하는것이 아니면 바로 return시켜 종료.
    return next();
  }

  // 비밀번호를 암호화한다.
  const salt = await bcrypt.genSalt(config.get<number>('saltRound'));
  // salt 생성.
  const hash = await bcrypt.hashSync(user.password, salt); // hash화.

  // console.log(`salt: ${salt}, hash: ${hash}`);
  user.password = hash;
  return next();
});

// plainPassword와 db에 암호화된 비밀번호를 비교
userSchema.methods.comparePassword = function (plainPassword, cb) {
  console.log(`Schema.methods.comparePassword`);
  // plainPassword: 1234567 vs 암호화된 비밀번호 비교
  bcrypt.compare(
    plainPassword,
    this.password,
    (err: any, isMatch: boolean | null) => {
      if (err) return cb(err, null);
      cb(null, isMatch);
    },
  );
};

userSchema.methods.generateToken = function (cb) {
  console.log(`Schema.methods.generateTOke`);
  // jsonwebtoken을 이용해서 token 생성하기
  let user = this;
  const sign = config.get<string>('sign');
  console.log(`methods generateToken user: ${user}, sign: ${sign}`);

  const token = jwt.sign(user._id.toHexString(), sign);
  user.token = token;

  user.save((err: Error | null, user: IUser) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

const UserModel = mongoose.model<IUserCallback>('User', userSchema);
export default UserModel;
