const express = require('express')
const router = express.Router()

const AuthController = require('./controllers/authController')
const AuthValidationMiddleware = require('../../common/middlewares/authValidationMiddleware')
const LoginMiddleware = require('./middlewares/loginMiddleware')
const UserValidatorMiddleware = require('../users/middlewares/userValidatorMiddleware')
const CommonMiddleware = require('../../common/middlewares/commonMiddleware')

router.post('/auth', [
  UserValidatorMiddleware.auth,
  CommonMiddleware.handleInvalidBody,
  LoginMiddleware.isPasswordAndUserMatch,
  AuthController.doLogin
])

router.post('/auth/logout', [
  AuthValidationMiddleware.validJWTNeeded,
  AuthController.doLogout
])

router.post('/auth/social', [
  UserValidatorMiddleware.authSocial,
  CommonMiddleware.handleInvalidBody,
  LoginMiddleware.processSocialLoginToken,
  AuthController.doLogin
])

router.post('/auth/refresh', [
  AuthValidationMiddleware.validJWTNeeded,
  AuthValidationMiddleware.verifyRefreshBodyField,
  AuthValidationMiddleware.validRefreshNeeded,
  AuthController.refreshToken
])

module.exports = router
