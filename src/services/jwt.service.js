import jwt from 'jsonwebtoken';

function sign(user) {
  const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET);

  return token;
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwtService = {
  sign,
  verify,
};
