import { Request, Response, NextFunction } from 'express';
import UserModel, { UserDocument } from '../models/user.model';

let auth = (req: Request, res: Response, next: NextFunction) => {
  // 인증처리 하는곳
  // 1. 클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;
  console.log(`auth token: ${token}`);

  // 2. 토큰을 복호화 한 후 유저를 찾는다.
  UserModel.findByToken(token, (err: Error | null, user: UserDocument) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.body.token = token;
    req.body.user = user;
    next();
  });
  // 3. 유저가 있으면 인증 Ok, 없으면 No
};

export default auth;
