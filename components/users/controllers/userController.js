const UserModel = require('../models/userModel')
const UserInfoModel = require('../models/userInfoModel')
const Utils = require('../../../utils/allUtils')
const moment = require('moment')
const constants = require('../../../common/utils/constants')
const Mailer = require('../../../utils/mailer')
const { checkResetToken, generatePasscode } = require('../../../utils/allUtils')
const { generateResetTokenEmail } = require('../models/userModel')

const jwtSecret = process.env.jwt_secret

/**
 * Register / Login User
 * @param { email : string } req.body
 */
exports.signUpIn = async (req, res) => {
  const { isTesting, email } = req.body
  const passcode = generatePasscode(4)

  let user = await UserModel.findByEmail(email)

  if (user) {
    const userId = user.get('id')
    const limitExpired = isTesting ? true : moment().subtract(0, 'minutes').isAfter(user.get('updated_at'))
    if (!limitExpired) {
      return res.status(200).send(Utils.buildErrorResponse(res.__('wait for 5 minutes to resend')))
    }
    user = await UserModel.update(userId, { passcode })
  } else user = await UserModel.create({ passcode, email })

  if (user) {
    setImmediate(() => { Mailer.sendSignUpInEmail(req, user, passcode) })
    Utils.responseUser(user)
    return res.status(201).send(Utils.buildDataResponse({ data: user }))
  } else {
    return res.status(200).send(Utils.buildErrorResponse(res.__('msg'), constants.ERROR_CODE.SAVE_ERROR))
  }
}

/**
   * Check passcode from user is matched with passcode in DB
   * @param { email : string} req.body
   * @param { passcode : string} req.body
   */
exports.checkPassCode = async (req, res) => {
  const { email, passcode } = req.body
  const user = await UserModel.findByEmail(email)

  if (user) {
    passcode === user.get('passcode')
      ? res.status(200).send(Utils.buildDataResponse({ msg: res.__('Passcode Correct') }))
      : res.status(200).send(
        Utils.buildErrorResponse(
          res.__('Passcode Incorrect'),
          constants.ERROR_CODE.PASSCODE_INCORRECT
        ))
  } else {
    res.status(200).send(
      Utils.buildErrorResponse(
        res.__('Email not existed'),
        constants.ERROR_CODE.EMAIL_NO_EXISTS
      ))
  }
}

/**
   * Active account after registered
   */
exports.activate = async (req, res) => {
  const userId = req.params.userId
  const code = req.params.code

  if (!code || !userId) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('Invalid params.'),
          constants.ERROR_CODE.INVALID
        )
      )
  }

  const salt = code.split('$')[0]
  const checkCode = Utils.generatePassword(userId + jwtSecret, salt, 'hex')

  if (checkCode !== code) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('Invalid activation code.'),
          constants.ERROR_CODE.INVALID
        )
      )
  }

  const user = await UserModel.update(userId, { activated_at: new Date() })

  if (!user) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('An unexpected error occured during updating user.'),
          constants.ERROR_CODE.SAVE_ERROR
        )
      )
  }

  const agent = req.headers['user-agent']
  if (agent.includes('Android')) {
    return res.redirect(
      'intent://activate#Intent;scheme=globics;package=com.app.globics;end'
    )
  } else if (agent.includes('iPhone')) {
    return res.redirect('globics://activate')
  } else {
    return res.redirect(`${process.env.web_url}`)
  }
}

exports.verifyEmail = async (req, res) => {
  const userId = req.params.userId
  const email = req.params.email
  const code = req.params.code

  const salt = code.split('$')[0]
  const checkCode = Utils.generatePassword(
    userId + email + jwtSecret,
    salt,
    'hex'
  )
  if (checkCode != code) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('Invalid verification code.'),
          constants.ERROR_CODE.INVALID
        )
      )
  }
  const existedEmail = await UserModel.findByEmail(email)
  if (existedEmail) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('Email already in use'),
          constants.ERROR_CODE.EMAIL_USED
        )
      )
  }
  UserModel.update(userId, { email: email })

  return res.status(200).send(
    Utils.buildDataResponse({
      msg: res.__('Your email has been updated successfully!')
    })
  )
}

/**
   * Send email when forgot password
   * @param { email : string } req
   */
exports.sendResetPasswordToken = async (req, res) => {
  const { email } = req.body
  const user = await UserModel.findByEmail(email)

  if (!user) {
    return res
      .status(302)
      .send(
        Utils.buildErrorResponse(
          res.__("E-mail doesn't exist."),
          constants.ERROR_CODE.EMAIL_NO_EXISTS
        )
      )
  } else {
    generateResetTokenEmail(req, res, user)
  }
}

/**
   * Check valid of reset code
   * @param {code: string} req
   */
exports.checkResetPasswordCode = (req, res) => {
  const { code } = req.body

  return res.status(200).send(
    Utils.buildDataResponse({
      msg: { isExpired: checkResetToken(code).isExpired }
    })
  )
}

/**
   * User reset password from forgot password email.
   * @param { code : string } req.body
   * @param { newPassword : string } req.body
   */
exports.resetPassword = async (req, res) => {
  const { code, password } = req.body
  const decryptedData = checkResetToken(code)
  const { decrypted, isExpired } = decryptedData

  if (!isExpired) {
    const hashPassword = Utils.generatePassword(password)
    const user = await UserModel.update(decrypted.user.id, {
      password: hashPassword,
      activated_at: new Date()
    })
    if (!user) {
      return res
        .status(200)
        .send(
          Utils.buildErrorResponse(
            res.__(
              'An unexpected error occured during updating password.'
            ),
            constants.ERROR_CODE.SAVE_ERROR
          )
        )
    } else {
      return res.status(200).send(
        Utils.buildDataResponse({
          msg: { success: 'Update user password successed' }
        })
      )
    }
  } else {
    return res.status(200).send(
      Utils.buildErrorResponse(
        res.__('reset code expired'),
        constants.ERROR_CODE.RESETCODE_EXPIRED
      )
    )
  }
}

exports.list = async (req, res) => {
  const limit = req.query.limit
  const page = req.query.page
  let role = req.query.role
  if (role) {
    role = role.split(',')
  }
  const result = await UserModel.list(role, limit, page)

  return res.status(200).send(Utils.buildDataResponse({ data: result }))
}

exports.search = async (req, res) => {
  const limit = req.query.limit
  const page = req.query.page
  const search = req.query.search

  const result = await UserModel.search(limit, page, search)

  return res.status(200).send(Utils.buildDataResponse({ data: result }))
}

exports.getById = async (req, res) => {
  const userInfo = await UserInfoModel.findByUserId(req.params.userId)
  const user = await UserModel.findById(req.params.userId)

  if (!user) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__('User not found.'),
          constants.ERROR_CODE.USER_NOT_FOUND
        )
      )
  }

  Utils.responseUser(user)
  return res.status(200).send(
    Utils.buildDataResponse({
      data: { user: { ...user.toJSON(), userInfo } }
    })
  )
}

exports.changePassword = async (req, res) => {
  let user = await UserModel.findById(req.params.userId)
  if (user) {
    const salt = user.get('password').split('$')[0]
    const checkNewPassword = Utils.generatePassword(
      req.body.password,
      salt
    )
    if (checkNewPassword === user.get('password')) {
      return res
        .status(200)
        .send(
          Utils.buildErrorResponse(
            res.__(
              "New password shouldn't be similar with the current."
            ),
            constants.ERROR_CODE.SAME_CURRENT_PASSWORD
          )
        )
    }
  }

  const newPassword = Utils.generatePassword(req.body.password)

  user = await UserModel.update(req.params.userId, { password: newPassword })

  if (!user) {
    return res
      .status(200)
      .send(
        Utils.buildErrorResponse(
          res.__(
            'An unexpected error occured during updating password.'
          ),
          constants.ERROR_CODE.SAVE_ERROR
        )
      )
  }

  return res
    .status(200)
    .send(Utils.buildDataResponse({ msg: res.__('Update succeeded!') }))
}

exports.removeById = (req, res) => {
  UserModel.removeById(req.params.userId).then((result) => {
    res.status(200).send(
      Utils.buildDataResponse({ msg: res.__('Delete succeeded!') })
    )
  })
}
