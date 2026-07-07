import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = uuidv4();

  const newUser = await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);

  res.send(userService.normazile(newUser));
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user || !user.password !== password) {
    return res.sendStatus(401);
  }

  const normalizedUser = userService.normazile(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
};
