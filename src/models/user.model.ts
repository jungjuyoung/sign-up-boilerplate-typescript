import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: true },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
