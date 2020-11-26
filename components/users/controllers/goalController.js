const UserGoalModel = require('../models/userGoalModel');
const Utils = require('../../../utils/allUtils');

exports.setGoals = async (req, res) => {
    let goals = req.body;
    let userId = req.jwt.userId;

    for (let goal of goals) {
        goal.user_id = userId;
    }

    let createdAt = goals[0].created_at || Utils.dateString();

    let result = await UserGoalModel.update(userId, goals, createdAt);
    if (!result) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during saving user\'s goals."))]});
    }

    res.status(200).send({msg: res.__("Update succeeded!")});
};

exports.goals = async (req, res) => {
    let userId = req.params.userId;
    let fromDate = req.params.fromDate;
    let toDate = req.params.toDate || fromDate;
    let goals = await UserGoalModel.goalsByUserId(userId, fromDate, toDate);
    
    return res.status(200).send(Utils.formatResponseArr(goals));
};