import { config } from './app.config';

export const jwtConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
  accessExpiry: config.jwt.expiresIn,
  refreshExpiry: config.jwt.refreshExpiresIn,
};

export default jwtConfig;
