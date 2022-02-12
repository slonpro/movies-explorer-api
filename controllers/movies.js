const BadRequest = require("../errors/bad-request");
const ForbiddenError = require("../errors/forbidden-err");
const NotFoundError = require("../errors/not-found-err");
const Movie = require("../models/movie");

module.exports.createMovies = (req, res, next) => {
  const { name, link } = req.body;
  Movie.create({ name, link, owner: req.user._id })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(", ")}`));
      } else {
        next(err);
      }
    });
};

module.exports.deleteSaveMovies = (req, res, next) => {
  Movie.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Нет карточки с таким id");
      }
      return card;
    })
    .then((card) => {
      if (card.owner._id.toString() === req.user._id) {
        Movie.findByIdAndRemove(req.params.movieId)
          .then((currentMovie) => res.status(201).send(currentMovie))
          .catch(next);
      } else {
        throw new ForbiddenError("Недостаточно прав");
      }
    })
    .catch(next);
};
