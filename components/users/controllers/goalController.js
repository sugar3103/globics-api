const UserGoalModel = require('../models/userGoalModel')
const Utils = require('../../../utils/allUtils')
const constants = require('../../../common/utils/constants')

exports.setGoals = async (req, res) => {
  const goals = req.body
  const userId = req.jwt.userId

  for (const goal of goals) {
    goal.user_id = userId
  }

  const createdAt = goals[0].created_at || Utils.dateString()

  const result = await UserGoalModel.update(userId, goals, createdAt)
  if (!result) {
    return res.status(200).send(Utils.buildErrorResponse(res.__("An unexpected error occurred during saving user's goals."), constants.ERROR_CODE.SAVE_ERROR))
  }

  res.status(200).send(Utils.buildDataResponse({ msg: res.__('Update succeeded!') }))
}

exports.goals = async (req, res) => {
  const { userId, fromDate, toDate, includeLatest } = req.params
  const goals = await UserGoalModel.goalsByUserId({ userId, fromDate, toDate, includeLatest })
  return res.status(200).send(Utils.buildDataResponse({ data: Utils.formatResponseArr(goals) }))
}
