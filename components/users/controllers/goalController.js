const UserGoalModel = require('../models/userGoalModel');
const Utils = require('../../../utils/allUtils');
const constants = require('../../../common/utils/constants');

exports.setGoals = async (req, res) => {
    let goals = req.body;
    let userId = req.jwt.userId;

    for (let goal of goals) {
        goal.user_id = userId;
    }

    let createdAt = goals[0].created_at || Utils.dateString();

    let result = await UserGoalModel.update(userId, goals, createdAt);
    if (!result) {
        return res.status(200).send(Utils.buildErrorResponse(res.__("An unexpected error occured during saving user\'s goals."), constants.ERROR_CODE.SAVE_ERROR));
    }

    res.status(200).send(Utils.buildDataResponse({msg: res.__("Update succeeded!")}));
};

exports.goals = async (req, res) => {
    const {userId, fromDate, toDate, includeLatest} = req.params;
    let goals = await UserGoalModel.goalsByUserId({userId, fromDate, toDate, includeLatest});
    return res.status(200).send(Utils.buildDataResponse({data: Utils.formatResponseArr(goals)}));
};