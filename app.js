const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const cors = require('cors');

const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
require('dotenv').config();

const { NODE_ENV, URL_MONGODB } = process.env;
const { PORT = 3000 } = process.env;

const app = express();

if (NODE_ENV === 'production') {
  mongoose.connect(`mongodb://localhost:27017/${URL_MONGODB}`);
} else {
  mongoose.connect('mongodb://localhost:27017/bitfilmsdb');
}

app.use('*', cors({
  origin: [
    'http://localhost:3001',
    'https://movies-pro.nomoredomains.work',
    'http://movies-pro.nomoredomains.work',
  ],
  methods: ['OPTIONS', 'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(require('./routes/index'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.use('/', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const message = statusCode === 500 ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
});

app.listen(PORT, () => {

});
