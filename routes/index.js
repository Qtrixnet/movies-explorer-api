const router = require('express').Router();
const movieRouter = require('./movies');
const userRouter = require('./users');
const { createUser, login } = require('../controllers/users');
const { validateCreateUser, validateLogin } = require('../middlewares/validations');
const NotFoundError = require('../errors/not-found-error');
const { urlNotFound } = require('../utils/constants');
const auth = require('../middlewares/auth');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use(auth);
router.use((req) => {
  throw new NotFoundError(`${urlNotFound} ${req.path} `);
});

module.exports = router;
