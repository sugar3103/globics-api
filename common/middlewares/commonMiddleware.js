const { validationResult } = require('express-validator')
const constants = require('../utils/constants')

exports.handleInvalidBody = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.debug(JSON.stringify(errors))
    const er = errors.array()
    er.map(item => item.msg = res.__(item.msg))
    return res.status(200).send({ code: constants.ERROR_CODE.BODY_FIELD_ERROR, errors: er })
  } else {
    return next()
  }
}
