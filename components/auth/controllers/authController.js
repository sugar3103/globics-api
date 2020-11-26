const jwtSecret = process.env.jwt_secret;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Utils = require('../../../utils/allUtils');
const UserModel = require('../../users/models/userModel');
const constants = require('../../../common/utils/constants');
const UserInfoModel = require('../../users/models/userInfoModel');

exports.doLogin = async (req, res) => {
    try {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = Utils.hash(req.body.userId + jwtSecret, salt);

        req.body.refreshKey = salt;
        let accessToken = jwt.sign(req.body, jwtSecret, {
            expiresIn : constants.accessTokenExprireIn
        });
        
        let b = new Buffer(hash);
        let refreshToken = b.toString('base64');

        let user = await UserModel.update(req.body.userId, {last_login_at: new Date()});
        let userInfo = await UserInfoModel.findByUserId(req.body.userId);
        let result = {
            accessToken: accessToken, 
            refreshToken: refreshToken,
            user: {
                ...user.toJSON({hidden: ['password']}),
                userInfo: userInfo
            }
        }
        res.status(201).send(result);
    } catch (err) {
        res.status(200).send({errors: [Utils.buildErrorMsg(err.message)]});
    }
};

exports.doLogout = async (req, res) => {
    UserModel.update(req.jwt.userId, {fcm_token: null});
    return res.status(200).send({msg: res.__("Logged out successfully.")});
};

exports.refreshToken = (req, res) => {
    try {
        req.body = req.jwt;
        req.body.refreshKey = crypto.randomBytes(16).toString('base64');;
        let accessToken = jwt.sign(req.body, jwtSecret);
        res.status(201).send({accessToken: accessToken});
    } catch (err) {
        res.status(200).send({errors: [Utils.buildErrorMsg(err.message)]});
    }
};
