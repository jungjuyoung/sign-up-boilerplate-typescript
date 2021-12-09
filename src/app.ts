import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import mongoose from 'mongoose';
import config from 'config';
import jwt from 'jsonwebtoken';
import UserModel, { IUser, IUserModel } from './models/User';

const app = express();
const port: number = 5000;
const mongURI = config.get<string>('URI');

mongoose
  .connect(mongURI)
  .then(() => console.log(`MongoDB Connected...`))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(`nodemone`);
  res.send('Hello Typescript World!!!');
});

app.post('/register', (req: Request, res: Response, next: NextFunction) => {
  // 회원가입 할때 필요한 정보들을 client에서 가져오면
  // 그것을 데이터 베이스에 넣어준다.
  const user = new UserModel(req.body);
  // User Schema 쪽에 pre로 미들웨어 작업 후 실행
  console.log(`user save`);
  user.save((err: any) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post('/login', (req: Request, res: Response, next: NextFunction) => {
  // 입력한 email이 DB에 있는지 찾는다.
  UserModel.findOne({ email: req.body.email }, (err: any, user: IUserModel) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }

    // 입력한 email이 DB에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });
      }

      // 비밀번호까지 맞다면 토큰을 생성하기.
      // user.generateToken((err, user) => {
      //   if (err) return res.status(400).send(err);
      //   // token을 쿠키에 저장.
      //   res
      //     .cookie('x_auth', user.token)
      //     .status(200)
      //     .json({ loginSuccess: true, userId: user._id });
      // });
    });
  });
});

app.listen(port, async () => {
  console.log(`Server http://localhost:${port}`);
});
