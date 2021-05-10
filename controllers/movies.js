const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const WrongIdError = require('../errors/wrong-id-error');
const {
  wrongData,
  wrongIdFormat,
  essenceNotFound,
  accessError,
  essenceDelete,
} = require('../utils/constants');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(wrongData);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  console.log(movieId);

  Movie.findById(movieId)
    .orFail(() => {
      throw new NotFoundError(`Фильм ${essenceNotFound}`);
    })
    .then((movie) => {
      console.log(movie);
      if (movie.owner.equals(req.user._id)) {
        movie.remove(movieId)
          .then(() => {
            res.status(200).send({ message: `Фильм ${essenceDelete}` });
          })
          .catch((err) => {
            next(err);
          });
      } else {
        throw new WrongIdError(accessError);
      }
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
  getMovies,
  createMovie,
  deleteMovie,
};
