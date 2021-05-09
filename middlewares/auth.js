const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-error');
const { authorizationRequired } = require('../utils/constants');

const { JWT_SECRET, NODE_ENV } = process.env;
const { devJwtKey } = require('../utils/config');

const extractBearerToken = (header) => header.replace('Bearer ', '');

//* мидлвара авторизации - проверяет наличие токена и верифицирует его
const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError(authorizationRequired);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : devJwtKey);
  } catch (err) {
    throw new AuthError(authorizationRequired);
  }

  req.user = payload;

  return next();
};

module.exports = auth;
