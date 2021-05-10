const router = require('express').Router();
const {
  updateUser, getUserInfo,
} = require('../controllers/users');
const {
  validateGetUserInfo,
  validateUpdateUser,
} = require('../middlewares/validations');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/me', validateGetUserInfo, getUserInfo);
router.patch('/me', validateUpdateUser, updateUser);

module.exports = router;
