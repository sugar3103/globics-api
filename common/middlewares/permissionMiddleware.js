const constants = require('../utils/constants')
const Utils = require('../utils/utils')

exports.minimumPermissionLevelRequired = (requiredRole) => {
  return (req, res, next) => {
    const userRole = parseInt(req.jwt.role)
    if (userRole >= requiredRole) {
      return next()
    } else {
      return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)))
    }
  }
}

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const userRole = parseInt(req.jwt.role)
  const userId = req.jwt.userId

  if (req.params && req.params.userId && userId === req.params.userId) {
    return next()
  } else {
    if (userRole & constants.role.ADMIN) {
      return next()
    } else {
      return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)))
    }
  }
}

exports.sameUserCantDoThisAction = (req, res, next) => {
  const userId = req.jwt.userId

  if (req.params.userId !== userId) {
    return next()
  } else {
    return res.status(200).send(Utils.buildErrorResponse(res.__('Permission denied.', constants.ERROR_CODE.PERMISSION_DENIED)))
  }
}
