import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  const token = uuidv4();

  await emailService.sendActivationEmail(email, token);

  res.send(newUser);
};

export const authController = {
  register,
};
