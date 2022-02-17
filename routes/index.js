const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  login,
  createUser,
} = require('../controllers/users');
const NotFoundError = require('../errors/not-found-err');
const auth = require('../middlewares/auth');

const { NODE_ENV } = process.env;

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

router.post('/logout', (req, res, next) => {
  if (NODE_ENV === 'production') {
    res
      .clearCookie('jwt', {
        secure: true,
        sameSite: 'none',
        domain: 'movies-pro.nomoredomains.work',
      });
  } else {
    res
      .clearCookie('jwt', {

      });
  }
  res.send({ message: 'Выход совершен успешно' });
  next();
});

router.use(auth);

router.use(require('./users'));
router.use(require('./movies'));

router.use('/', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
module.exports = router;
