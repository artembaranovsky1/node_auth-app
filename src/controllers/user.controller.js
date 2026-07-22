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

  try {
    jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.badRequest('Reset link has expired or is invalid');
  }

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

const getProfile = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  const normalizedUser = userService.normazile(user);

  if (!normalizedUser) {
    throw ApiError.notFound('User not found');
  }

  res.send(normalizedUser);
};

const changeName = async (req, res) => {
  const userId = req.user.id;
  const newName = req.body.name;

  if (!newName) {
    throw ApiError.badRequest('User name is required');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User is not found');
  }

  await userService.updateName(user, newName);

  res.status(200).json({ message: `Name changed to ${newName}` });
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword1, newPassword2 } = req.body;
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User is not found');
  }

  if (!oldPassword || !newPassword1 || !newPassword2) {
    throw ApiError.notFound('passwords is required');
  }

  if (newPassword1 !== newPassword2) {
    throw ApiError.badRequest('New passwords do not match');
  }

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    throw ApiError.badRequest('Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword1, 10);

  await userService.updatePassword(user, hashedPassword);

  res.status(200).send('Reset password successfully');
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail1, newEmail2 } = req.body;

  if (!password || !newEmail1 || !newEmail2) {
    throw ApiError.badRequest(
      'Password and new email confirmation are required',
    );
  }

  if (newEmail1 !== newEmail2) {
    throw ApiError.badRequest('New emails do not match');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  const oldEmail = user.email;

  if (oldEmail === newEmail1) {
    throw ApiError.badRequest(
      'New email must be different from the current one',
    );
  }

  await userService.updateEmail(user, newEmail1);

  await emailService.sendChangeEmailNotification(oldEmail);

  res.status(200).json({
    message: 'Email changed successfully. Notification sent to old email.',
  });
};

export const userController = {
  getAllUsers,
  resetMail,
  reset,
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
