import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import mongoose from 'mongoose';
import config from 'config';
import User from './models/User';

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
  const user = new User(req.body);
  // User Schema 쪽에 pre로 미들웨어 작업 후 실행
  user.save((err: any) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.listen(port, async () => {
  console.log(`Server http://localhost:${port}`);
});
