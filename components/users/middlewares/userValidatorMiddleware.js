const { body, param } = require('express-validator')
const UserModel = require('../models/userModel')
const constants = require('../../../common/utils/constants')

const userValidator = {
  first_name: body('first_name').not().isEmpty().trim().withMessage('First name is invalid'),
  last_name: body('last_name').not().isEmpty().trim().withMessage('Last name is invalid'),
  email: body('email').isEmail().trim().withMessage('E-mail is invalid'),
  password: body('password').matches('^(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=!*?-_])(?=\\S+$).{8,}$').withMessage('Password must contain at least 8 characters, one uppercase letter, one number and one special character'),
  email_already_in_use: body('email').custom(async email => {
    const user = await UserModel.findByEmail(email)
    if (user) {
      throw new Error('Email already in use')
    }
    return true
  }),
  code: body('code').isUUID
}

const codeValidator = {
  code: body('code').notEmpty()
}

exports.signUpInMiddleWare = [
  userValidator.email
]

// exports.signup = [
//   userValidator.first_name,
//   userValidator.last_name,
//   userValidator.email,
//   userValidator.password,
//   userValidator.email_already_in_use
// ]

exports.resentActivationEmail = [
  userValidator.email
]

exports.auth = [
  userValidator.email,
  body('password').not().isEmpty().withMessage('Password is invalid')
]

exports.authSocial = [
  body('type').isIn(['facebook', 'apple', 'google']).withMessage('type should be facebook/google/apple')
]

exports.sendResetCodeMiddleWare = [
  userValidator.email
]

exports.checkResetPasswordMiddleWare = [
  codeValidator.code
]

exports.resetPasswordMiddleWare = [
  userValidator.password,
  codeValidator.code
]

exports.forgotAccount = [
  body('first_name').isString().trim().withMessage('First name is invalid'),
  body('last_name').isString().trim().withMessage('Last name is invalid'),
  body('birth_date').isString().withMessage('Birthday is invalid')
]

exports.changePassword = [
  userValidator.password
]

exports.update = [
  param('userId').not().isEmpty(),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('email').optional().isEmail().trim().withMessage('E-mail is invalid'),
  body('mobile_phone').optional().isMobilePhone().withMessage('Mobile phone is invalid'),
  body('address1').optional().trim(),
  body('address2').optional().trim(),
  body('city').optional().trim(),
  body('zip').optional().isPostalCode('any').withMessage('Zip is invalid'),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('height').optional().isInt({ min: 100, max: 300 }).withMessage('Height is invalid'),
  body('height_unit').optional().isIn(['M', 'I']).withMessage('Height unit is invalid'),
  body('weight').optional().isInt({ min: 20000, max: 300000 }).withMessage('Weight is invalid'),
  body('weight_unit').optional().isIn(['K', 'P']).withMessage('Weight unit is invalid'),
  body('title').optional().isIn(['Ms', 'Mr']).withMessage('Title is invalid'),
  body('birth_date').optional().matches(constants.DATE_REGEX).withMessage('Birthday is invalid'),
  body('shape').optional().isIn(['L', 'G', 'E', 'A']).withMessage('Shape is invalid'),
  body('updated_at').optional().matches(constants.DATE_REGEX).withMessage('Updated_at is invalid')
]

exports.goals = [
  body('*.type').isIn(constants.GOALS).withMessage('Type is invalid'),
  body('*.value').isInt().withMessage('Value is invalid'),
  body('*.unit').isIn([null, 'M', 'K', 'P', 'H']).withMessage('Unit is invalid'),
  body('*.time_frame').isIn(['D', 'W', 'T']).withMessage('Time frame is invalid'),
  body().custom(body => {
    constants.GOALS.forEach(type => {
      if (body.filter(i => i.type === type).length > 1) {
        throw new Error(`Goals type ${type} duplicate.`)
      }
    })
    return true
  })
]

exports.feedback = [
  body('text').isString().withMessage('text is invalid')
]

exports.weights = [
  body('*.weight').isInt().withMessage('Weight is invalid'),
  body('*.date').matches(constants.DATE_REGEX).withMessage('Date is invalid')
]

exports.verifyEmail = [
  param('userId').isString().withMessage('Invalid params'),
  param('email').isString().withMessage('Invalid params'),
  param('code').isString().withMessage('Invalid params')
]
