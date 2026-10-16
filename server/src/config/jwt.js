import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'wedate_dev_secret_key_change_in_production_2026';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload) => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: getExpiresIn()
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    return null;
  }
};
