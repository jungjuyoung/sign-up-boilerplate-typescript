import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';

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

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
