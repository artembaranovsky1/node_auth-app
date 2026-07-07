import { User } from '../models/user.js';

function normazile({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

export const userService = {
  normazile,
  findByEmail,
};
