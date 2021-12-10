import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

export interface IUser {
  name: string;
  email: string;
  password: string;
  lastname: string;
  role: number;
  image: string;
  token: string;
  tokenExp: number;
  _id: jwt.JwtPayload | string;
}
export interface IUserDocument extends Document {
  comparePassword: (
    plainPassword: string,
    cb: (err: Error | null, isMatch: boolean | null) => void,
  ) => void;
  generateToken: (cd: (err: Error, user: IUser) => void) => void;
}

export interface IUserModel extends Model<IUserDocument> {
  findByToken: (token: string, cb: (err: Error, user: IUser) => void) => void;
}

const userSchema: Schema = new mongoose.Schema<IUser>({
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

// 회원가입 하기전에 전처리
userSchema.pre('save', async function (next) {
  console.log('User모델 pre save');
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
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return cb(err, null);
    cb(null, isMatch);
  });
};

// 토큰생성
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

//
userSchema.statics.findByToken = function (token: string, cb) {
  let user = this;
  // 토큰을 decoded한다.
  jwt.verify(token, config.get<string>('sign'), (err, decoded) => {
    // 유저 아이디를 이용해서 유저를 찾은 다음에,
    // 클라이언트에서 가져온 token과 DB에 있는 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token }, (err: Error, user: IUser) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const UserModel = mongoose.model<IUserDocument, IUserModel, IUser>(
  'User',
  userSchema,
);
export default UserModel;
