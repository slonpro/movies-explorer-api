const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const ConflictError = require('../errors/conflict-error');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const checkUser = (user, res) => {
  if (!user) {
    throw new NotFoundError('Нет пользователя с таким id');
  }
  res.send(user);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Пользователь с данным email существует');
      } else {
        return bcrypt.hash(password, 10);
      }
    })
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then(() => res.status(201).send({
      data: {
        name, email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else {
        next(err);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => checkUser(user, res))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { password, email } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new ConflictError('Пользователь с данным email существует'));
      } else {
        return bcrypt.hash(password, 10);
      }
    })
    .then((hash) => User.findByIdAndUpdate(
      req.user._id,
      { password: hash, email },
      { new: true, runValidators: true },
    )
      .then((user) => checkUser(user, res))
      .catch(next));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '24h' },
      );
      if (NODE_ENV === 'production') {
        res
          .cookie('jwt', token, {
            maxAge: 3600000 * 12 * 7,
            secure: true,
            sameSite: 'none',
            domain: 'movies-pro.nomoredomains.work',
          });
      } else {
        res
          .cookie('jwt', token, {
            maxAge: 3600000 * 12 * 7,
          });
      }

      res.send({ token });
    })
    .catch(next); // Сообщение ошибки передается в модели пользователя
};
