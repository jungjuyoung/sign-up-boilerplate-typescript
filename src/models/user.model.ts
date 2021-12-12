import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  image: string;
  token: string;
  tokenExp: number;
  _id: jwt.JwtPayload | string;
  timestamps: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
}
export interface IUserDocument extends Document {
  generateToken: (cd: (err: Error, user: UserDocument) => void) => void;
}

// export interface IUserModel extends Model<IUserDocument> {
//   findByToken: (
//     token: string,
//     cb: (err: Error, user: UserDocument) => void,
//   ) => void;
// }

const userSchema: Schema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      minlength: 5,
    },
    image: String,
    token: { type: String },
    tokenExp: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

// 회원가입 하기전에 전처리
userSchema.pre('save', async function (next) {
  console.log('User모델 pre save');
  const user: UserDocument = this;

  if (!user.isModified('password')) {
    return next();
  }

  // 비밀번호를 암호화한다.
  // salt 생성.
  const salt = await bcrypt.genSalt(config.get<number>('saltRound'));
  // salt를 이용해서 hash화.
  const hash = await bcrypt.hashSync(user.password, salt);

  // console.log(`salt: ${salt}, hash: ${hash}`);
  user.password = hash;
  return next();
});

// plainPassword와 db에 암호화된 비밀번호를 비교
userSchema.methods.comparePassword = async function (
  plainPassword: string,
): Promise<boolean> {
  console.log(`Schema.methods.comparePassword`);
  const user: UserDocument = this;
  // plainPassword: 1234567 vs 암호화된 비밀번호 비교 by bcrypt.compare
  return bcrypt.compare(plainPassword, user.password).catch((e) => false);
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

// 토큰찾기
userSchema.statics.findByToken = function (token: string, cb) {
  let user = this;
  // 토큰을 decoded한다.
  jwt.verify(token, config.get<string>('sign'), (err, decoded) => {
    // 유저 아이디를 이용해서 유저를 찾은 다음에,
    // 클라이언트에서 가져온 token과 DB에 있는 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token }, (err: Error, user: UserDocument) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
