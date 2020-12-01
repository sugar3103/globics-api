const constants = require('../utils/constants');
const Utils = require('../utils/utils');

exports.minimumPermissionLevelRequired = (required_role) => {
    return (req, res, next) => {
        let user_role = parseInt(req.jwt.role);
        let userId = req.jwt.userId;
        if (user_role >= required_role) {
            return next();
        } else {
            return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)));
        }
    };
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {

    let user_role = parseInt(req.jwt.role);
    let userId = req.jwt.userId;

    if (req.params && req.params.userId && userId == req.params.userId) {
        return next();
    } else {
        if (user_role & constants.role.ADMIN) {
            return next();
        } else {
            return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)));
        }
    }

};

exports.sameUserCantDoThisAction = (req, res, next) => {
    let userId = req.jwt.userId;

    if (req.params.userId != userId) {
        return next();
    } else {
        return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)));
    }

};
