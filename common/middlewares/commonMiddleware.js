const { validationResult } = require('express-validator')
const constants = require('../utils/constants')

exports.handleInvalidBody = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.debug(JSON.stringify(errors))
    if (!errors.code) {
      errors.code = constants.ERROR_CODE.BODY_FIELD_ERROR
    }
    return res.status(200).send(errors)
  } else {
    return next()
  }
}
