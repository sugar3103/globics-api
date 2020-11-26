const {validationResult} = require('express-validator');

exports.handleInvalidBody = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.debug(JSON.stringify(errors));
        return res.status(200).send(errors);
    } else {
        return next();
    }
}
