import { userService } from '../services/user.service.js';
import { ApiError } from './expations/api.error.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { emailService } from '../services/email.service.js';
import bcrypt from 'bcrypt';

const getAllUsers = async (req, res) => {
  const users = await userService.getUsers();

  res.send(users);
};

const resetMail = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const resetToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetEmail(email, resetToken);

  res.status(205).send('Reset mail send');
};

const reset = async (req, res) => {
  const { resetToken } = req.params;

  const user = await User.findOne({
    where: { resetToken },
  });

  if (!user) {
    throw ApiError.notFound('Invalid reset token');
  }

  const { password1, password2 } = req.body;

  if (!password1 || !password2) {
    throw ApiError.badRequest('Enter your password');
  }

  if (password1 !== password2) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(password1, 10);

  await userService.updatePassword(user, hashedPassword);

  res.status(200).send('Reset password successfully');
};

export const userController = {
  getAllUsers,
  resetMail,
  reset,
};
