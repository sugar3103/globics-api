const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwt_secret;
const constants = require('../utils/constants');
const Utils = require('../utils/utils');
const DateUtils = require('../utils/dateUtils');

exports.verifyRefreshBodyField = (req, res, next) => {
    if (req.body && req.body.refreshToken) {
        return next();
    } else {
        return res.status(200).send(Utils.buildErrorResponse(res.__('Need to pass refreshToken field.'), constants.ERROR_CODE.INVALID));
    }
};

exports.validRefreshNeeded = (req, res, next) => {
    let b = new Buffer(req.body.refreshToken, 'base64');
    let refreshToken = b.toString();
    let hash = Utils.hash(req.jwt.userId + jwtSecret, req.jwt.refreshKey);
    if (hash != refreshToken) {
        return res.status(200).send(Utils.buildErrorResponse(res.__('Invalid refresh token.'), constants.ERROR_CODE.INVALID));
    }

    req.body = req.jwt;
    return next();
};


exports.validJWTNeeded = (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(200).send(Utils.buildErrorResponse(res.__('Invalid access token.'), constants.ERROR_CODE.INVALID));
    }

    try {
        let authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
            return res.status(200).send(Utils.buildErrorResponse(res.__('Invalid access token.'), constants.ERROR_CODE.INVALID));
        }
        req.jwt = jwt.verify(authorization[1], jwtSecret);
        // Log all requests except file upload
        let contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart')) {
            let requestLog = `${req.jwt.userId} ${req.method} ${req.originalUrl} ${req.jwt.email} ${req.headers['time-zone']} ${req.headers['user-agent']}`;
            console.debug(requestLog , JSON.stringify(req.body));
        }
        
        // Preprocess Date to DateTime with specified timezone
        let timezone = req.headers['time-zone'];
        if (req.params.fromDate) {
            req.params.fromDateTime = DateUtils.convertDateStringToDateTimeWithTimeZone(req.params.fromDate, constants.START_TIME_STRING, timezone);
            req.params.toDateTime = DateUtils.convertDateStringToDateTimeWithTimeZone(req.params.toDate || req.params.fromDate, constants.END_TIME_STRING, timezone);
        }
        return next();

    } catch (err) {
        console.error(err);
        return res.status(200).send(Utils.buildErrorResponse(err.message, constants.ERROR_CODE.UNKNOWN));
    }
};
