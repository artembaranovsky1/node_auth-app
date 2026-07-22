import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../controllers/expations/api.error.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

function getUsers() {
  return User.findAll();
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findOne({ where: { id } });
}

function findByResetToken(resetToken) {
  return User.findOne({ where: { resetToken } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function sendResetPasswordLink(email) {
  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  const user = await findByEmail(email);

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
}

async function resetPassword(resetToken, password1, password2) {
  if (!password1 || !password2) {
    throw ApiError.badRequest('Enter your password');
  }

  if (password1 !== password2) {
    throw ApiError.badRequest('Passwords do not match');
  }

  try {
    jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.badRequest('Reset link has expired or is invalid');
  }

  const user = await findByResetToken(resetToken);

  if (!user) {
    throw ApiError.badRequest('Invalid reset token');
  }

  const isSamePassword = await bcrypt.compare(password1, user.password);

  if (isSamePassword) {
    throw ApiError.badRequest('You are already using this password');
  }

  const hashedPassword = await bcrypt.hash(password1, 10);

  await updatePassword(user, hashedPassword);
}

async function getProfile(userId) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  return normalize(user);
}

async function updateName(userId, newName) {
  if (!newName || !newName.trim()) {
    throw ApiError.badRequest('User name is required');
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound('User is not found');
  }

  if (newName === user.name) {
    throw ApiError.badRequest('You are already using this name');
  }

  user.name = newName.trim();

  await user.save();

  return user;
}

async function changePassword(
  userId,
  { oldPassword, newPassword1, newPassword2 },
) {
  if (!oldPassword || !newPassword1 || !newPassword2) {
    throw ApiError.badRequest('passwords is required');
  }

  if (newPassword1 !== newPassword2) {
    throw ApiError.badRequest('New passwords do not match');
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound('User is not found');
  }

  if (newPassword1 === user.password) {
    throw ApiError.badRequest('You are already using this password');
  }

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    throw ApiError.badRequest('Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword1, 10);

  await updatePassword(user, hashedPassword);
}

async function updatePassword(user, hashedPassword) {
  user.password = hashedPassword;
  user.resetToken = null;

  await user.save();

  return user;
}

async function changeEmail(userId, { password, newEmail1, newEmail2 }) {
  if (!password || !newEmail1 || !newEmail2) {
    throw ApiError.badRequest(
      'Password and new email confirmation are required',
    );
  }

  if (newEmail1 !== newEmail2) {
    throw ApiError.badRequest('New emails do not match');
  }

  const user = await findById(userId);

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

  await updateEmail(user, newEmail1);

  await emailService.sendChangeEmailNotification(oldEmail);
}

async function updateEmail(user, newEmail) {
  user.email = newEmail;

  await user.save();

  return user;
}

export const userService = {
  normalize,
  findByEmail,
  findById,
  getUsers,
  register,
  updateName,
  sendResetPasswordLink,
  updatePassword,
  resetPassword,
  getProfile,
  changePassword,
  changeEmail,
};
