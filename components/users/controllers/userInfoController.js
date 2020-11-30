const {v4: uuidv4} = require("uuid");
const UserModel = require('../models/userModel');
const UserInfoModel = require('../models/userInfoModel');
const UserHistoryModel = require('../models/userHistoryModel');
const Utils = require('../../../utils/allUtils');
const Mailer = require('../../../utils/mailer');

exports.patchById = async (req, res) => {
  let userId = req.params.userId;
  let user;
  let userData = {};
  if (req.body.email) {
    delete req.body.email;
  }
  if (req.body.first_name) userData.first_name = req.body.first_name;
  if (req.body.last_name) userData.last_name = req.body.last_name;
  if (req.body.role != null) userData.role = req.body.role;

  // Update user table
  if (!Utils.isEmptyOrNull(userData)) {
    user = await UserModel.update(userId, userData);
    if (!user) {
      return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during updating user."))]});
    }
    Utils.responseUser(user);

    // remove email, first_name, last_name for updating user_info
    for (const [key, value] of Object.entries(userData)) {
      delete req.body[key]
    }
  }

  // Update user_info table
  if (!Utils.isEmptyOrNull(req.body)) {
    let userInfo = await UserInfoModel.update(userId, req.body);
    if (!userInfo) {
      return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during updating user info."))]});
    }
    return res.status(200).send({user, userInfo});
  }
  return res.status(200).send({user});
};

exports.uploadAvatar = async (req, res) => {
  return res.status(200).send({ url: 'not working now!' });
};

/**
 * Insert weight of user in multiple days
 */

exports.insertWeights = async (req, res) => {
  let weights = req.body;
  let userId = req.jwt.userId;
  for (let item of weights) {
    let result = await UserHistoryModel.updateWeight(userId, item.weight, item.date);
    if (!result) {
      return res.status(200).send({ errors: [Utils.buildErrorMsg(res.__("An unexpected error occurred during synchronizing weight item with cloud."))] });
    }
  }
  res.status(200).send({msg: res.__("Update succeeded!")});
};