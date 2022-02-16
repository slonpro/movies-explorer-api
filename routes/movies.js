const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createMovies,
  deleteSaveMovies,
} = require('../controllers/movies');

/* создаёт фильм с переданными в теле
country,
director,
duration,
year,
description,
image,
trailer,
nameRU,
nameEN,
thumbnail,
 movieId */
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(/^(https?:\/\/)?[\w-]{1,}\.\w{1,10}[^\s@]*/).min(7),
    trailerLink: Joi.string().required().pattern(/^(https?:\/\/)?[\w-]{1,}\.\w{1,10}[^\s@]*/).min(7),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().pattern(/^(https?:\/\/)?[\w-]{1,}\.\w{1,10}[^\s@]*/).min(7),
    movieId: Joi.number().required(),
  }),
}), createMovies);
router.delete('/movies/:moviesId', celebrate({
  params: Joi.object().keys({
    moviesId: Joi.string().length(24).hex(),
  }),
}), deleteSaveMovies);
module.exports = router;
