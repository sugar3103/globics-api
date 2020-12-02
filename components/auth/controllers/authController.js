const jwtSecret = process.env.jwt_secret
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Utils = require('../../../utils/allUtils')
const UserModel = require('../../users/models/userModel')
const constants = require('../../../common/utils/constants')
const UserInfoModel = require('../../users/models/userInfoModel')

exports.doLogin = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16).toString('base64')
    const hash = Utils.hash(req.body.userId + jwtSecret, salt)

    req.body.refreshKey = salt
    const accessToken = jwt.sign(req.body, jwtSecret, {
      expiresIn: constants.accessTokenExprireIn
    })

    const b = Buffer.from(hash)
    const refreshToken = b.toString('base64')

    const user = await UserModel.update(req.body.userId, { last_login_at: new Date() })
    const userInfo = await UserInfoModel.findByUserId(req.body.userId)
    Utils.responseUser(user)
    const result = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        ...user.toJSON(),
        userInfo: userInfo
      }
    }
    res.status(201).send(Utils.buildDataResponse({ data: result, msg: res.__('Logged successfully!') }))
  } catch (err) {
    res.status(200).send(Utils.buildErrorResponse(err.message, constants.ERROR_CODE.UNKNOWN))
  }
}

exports.doLogout = async (req, res) => {
  UserModel.update(req.jwt.userId, { fcm_token: null })
  return res.status(200).send(Utils.buildDataResponse({ msg: res.__('Logged out successfully.') }))
}

exports.refreshToken = (req, res) => {
  try {
    req.body = req.jwt
    req.body.refreshKey = crypto.randomBytes(16).toString('base64')
    const accessToken = jwt.sign(req.body, jwtSecret)
    res.status(201).send(Utils.buildDataResponse({ data: { accessToken: accessToken } }))
  } catch (err) {
    res.status(200).send(Utils.buildErrorResponse(err.message, constants.ERROR_CODE.UNKNOWN))
  }
}
