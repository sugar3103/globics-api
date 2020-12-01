const UserModel = require('../models/userModel')
const UserInfoModel = require('../models/userInfoModel')
const UserHistoryModel = require('../models/userHistoryModel')
const Utils = require('../../../utils/allUtils')
const constants = require('../../../common/utils/constants')

exports.patchById = async (req, res) => {
  const userId = req.params.userId
  let user
  const userData = {}
  if (req.body.email) {
    delete req.body.email
  }
  if (req.body.first_name) userData.first_name = req.body.first_name
  if (req.body.last_name) userData.last_name = req.body.last_name
  if (req.body.role != null) userData.role = req.body.role

  // Update user table
  if (!Utils.isEmptyOrNull(userData)) {
    user = await UserModel.update(userId, userData)
    if (!user) {
      return res.status(200).send(Utils.buildErrorResponse(res.__('An unexpected error occurred during updating user.'), constants.ERROR_CODE.SAVE_ERROR))
    }
    Utils.responseUser(user)

    // remove email, first_name, last_name for updating user_info
    for (const [key] of Object.entries(userData)) {
      delete req.body[key]
    }
  }

  // Update user_info table
  if (!Utils.isEmptyOrNull(req.body)) {
    const userInfo = await UserInfoModel.update(userId, req.body)
    if (!userInfo) {
      return res.status(200).send(Utils.buildErrorResponse(res.__('An unexpected error occurred during updating user info.'), constants.ERROR_CODE.SAVE_ERROR))
    }
    return res.status(200).send(Utils.buildDataResponse({ data: { user, userInfo } }))
  }
  return res.status(200).send(Utils.buildDataResponse({ data: { user } }))
}

exports.uploadAvatar = async (req, res) => {
  return res.status(200).send(Utils.buildDataResponse({ data: { url: 'not working now!' } }))
}

/**
 * Insert weight of user in multiple days
 */

exports.insertWeights = async (req, res) => {
  const weights = req.body
  const userId = req.jwt.userId
  for (const item of weights) {
    const result = await UserHistoryModel.updateWeight(userId, item.weight, item.date)
    if (!result) {
      return res.status(200).send(Utils.buildErrorResponse(res.__('An unexpected error occurred during synchronizing weight item with cloud.'), constants.ERROR_CODE.SAVE_ERROR))
    }
  }
  res.status(200).send(Utils.buildDataResponse({ msg: res.__('Update succeeded!') }))
}
