const express = require('express')
const router = express.Router()

const constants = require('../../common/utils/constants')
const UserValidatorMiddleware = require('./middlewares/userValidatorMiddleware')
const CommonMiddleware = require('../../common/middlewares/commonMiddleware')
const UsersController = require('./controllers/userController')
const UserInfoController = require('./controllers/userInfoController')
const PermissionMiddleware = require('../../common/middlewares/permissionMiddleware')
const AuthValidationMiddleware = require('../../common/middlewares/authValidationMiddleware')
const GoalController = require('./controllers/goalController')

const ADMIN = constants.role.ADMIN
const SUPER_USER = constants.role.SUPER_USER

router.post('/users', [
  UserValidatorMiddleware.signUpInMiddleWare,
  CommonMiddleware.handleInvalidBody,
  UsersController.signUpIn
])

router.get('/users/activate/:userId/:code', [UsersController.activate])

router.get('/users/verify/:userId/:email/:code', [
  UserValidatorMiddleware.verifyEmail,
  UsersController.verifyEmail
])

router.post('/users/send-reset-code', [
  UserValidatorMiddleware.sendResetCodeMiddleWare,
  CommonMiddleware.handleInvalidBody,
  UsersController.sendResetPasswordToken
])

router.post('/users/check-reset-code', [
  UserValidatorMiddleware.checkResetPasswordMiddleWare,
  UsersController.checkResetPasswordCode
])

router.post('/users/reset-password/', [
  UserValidatorMiddleware.resetPasswordMiddleWare,
  UsersController.resetPassword])

router.get('/users', [
  AuthValidationMiddleware.validJWTNeeded,
  PermissionMiddleware.minimumPermissionLevelRequired(SUPER_USER),
  UsersController.list
])

router.get('/users/search', [
  AuthValidationMiddleware.validJWTNeeded,
  PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
  UsersController.search
])

router.get('/users/:userId', [
  AuthValidationMiddleware.validJWTNeeded,
  PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
  UsersController.getById
])

router.patch('/users/:userId', [
  AuthValidationMiddleware.validJWTNeeded,
  UserValidatorMiddleware.update,
  CommonMiddleware.handleInvalidBody,
  PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
  UserInfoController.patchById
])

router.post('/users/avatar', [
  AuthValidationMiddleware.validJWTNeeded,
  UserInfoController.uploadAvatar
])

router.post('/users/:userId/changepassword', [
  AuthValidationMiddleware.validJWTNeeded,
  UserValidatorMiddleware.changePassword,
  CommonMiddleware.handleInvalidBody,
  PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
  UsersController.changePassword
])

router.post('/users/goals', [
  AuthValidationMiddleware.validJWTNeeded,
  UserValidatorMiddleware.goals,
  CommonMiddleware.handleInvalidBody,
  GoalController.setGoals
])

router.get('/users/:userId/goals/:fromDate/:toDate', [
  AuthValidationMiddleware.validJWTNeeded,
  PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
  GoalController.goals
])

router.delete('/users/:userId', [
  AuthValidationMiddleware.validJWTNeeded,
  PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
  UsersController.removeById
])

module.exports = router
