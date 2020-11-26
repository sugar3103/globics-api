const Utils = require('../../../utils/allUtils');
const moment = require('moment-timezone');

module.exports = (req, res, next) => {
  let timezone = req.headers['time-zone'];
  if (!moment.tz.names().includes(timezone)) {
    console.error(`Invalid timezone ${timezone}`);
    return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid timezone"))]});
  }
  return next();
};

