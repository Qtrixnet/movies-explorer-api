const { JWT_SECRET, NODE_ENV } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { devJwtKey } = require('../utils/config');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const AuthError = require('../errors/auth-error');
const EmailError = require('../errors/email-error');
const {
  wrongData,
  emailAlreadyRegistered,
  essenceNotFound,
  wrongEmailOrPassword,
  wrongIdFormat,
} = require('../utils/constants');

const createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({ data: user.toJSON() });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(wrongData);
      } else if (err.name === 'MongoError') {
        throw new EmailError(emailAlreadyRegistered);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials({ email, password })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`Пользователь ${essenceNotFound}`);
      } else {
        res.status(200).send({ token: jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : devJwtKey, { expiresIn: '7d' }) });
      }
    })
    .catch(() => {
      throw new AuthError(wrongEmailOrPassword);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const newUserName = req.body.name;
  const newUserEmail = req.body.email;
  const userId = req.user._id;
  User.findByIdAndUpdate(
    userId,
    {
      name: newUserName,
      email: newUserEmail,
    },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(`Пользователь ${essenceNotFound}`);
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError(wrongData);
      } else if (err.name === 'MongoError') {
        throw new EmailError(emailAlreadyRegistered);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      const { email, name } = user;
      if (!user) {
        throw new NotFoundError(`Пользователь ${essenceNotFound}`);
      }
      return res.send({ email, name });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new BadRequestError(wrongIdFormat);
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  updateUser,
  getUserInfo,
};
