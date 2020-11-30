const UserModel = require('../models/userModel');
const UserInfoModel = require('../models/userInfoModel');
const Utils = require('../../../utils/allUtils');
const Mailer = require('../../../utils/mailer');
const jwtSecret = process.env.jwt_secret;
const shortid = require('shortid');

/**
 * Register user
 */
exports.create = async (req, res) => {
    req.body.password = Utils.generatePassword(req.body.password);
    req.body.permissionLevel = 1;
    let user = await UserModel.create(req.body);
    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occurred during saving user."))]});
    }
    setImmediate(()=>{
        Mailer.sendActivationEmail(req, user);
    })
    Utils.responseUser(user);
    return res.status(201).send(user);
};

/**
 * Active account after registered
 */
exports.activate = async (req, res) => {
    let userId = req.params.userId;
    let code = req.params.code;

    if (!code || !userId) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid params."))]});
    }

    let salt = code.split('$')[0];
    let checkCode = Utils.generatePassword(userId + jwtSecret, salt, 'hex');

    if (checkCode !== code) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid activation code."))]});
    }

    let user = await UserModel.update(userId, {activated_at: new Date()});

    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during updating user."))]});
    }

    let agent = req.headers['user-agent'];
    if (agent.includes('Android')) {
        return res.redirect(`intent://activate#Intent;scheme=globics;package=com.app.globics;end`);
    }
    else if (agent.includes('iPhone')) {
        return res.redirect(`globics://activate`);
    }
    else {
        return res.redirect(`${process.env.web_url}/login?activated=true`);
    }
};

exports.verifyEmail = async (req, res) => {
    let userId = req.params.userId;
    let email = req.params.email;
    let code = req.params.code;

    let salt = code.split('$')[0];
    let checkCode = Utils.generatePassword(userId + email + jwtSecret, salt, 'hex');
    if (checkCode != code) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid verification code."))]});
    }
    let existedEmail = await UserModel.findByEmail(email);
    if (existedEmail) return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Email already in use"))]});
    UserModel.update(userId, {email: email});

    return res.status(200).send(res.__('Your email has been updated successfully!'));
}

/**
 * Send email when forgot password
 */
exports.forgotPassword = async (req, res) => {
    let user = await UserModel.findByEmail(req.body.email);
    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("E-mail doesn\'t exist."))]});
    }

    setImmediate(() => {
        let newPassword = shortid.generate();
        Mailer.sendResetPasswordEmail(req, user, newPassword);
    })

    return res.status(200).send({msg: res.__("We have sent you an email to reset your password.")});
};

/**
 * When forgot account
 */
exports.forgotAccount = async (req, res) => {
    const body = req.body;
    let users = await UserModel.findAccount(body.first_name, body.last_name, body.birth_date);
    if (!users || users.length === 0) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("User account not matched."))]});
    }
    return res.status(200).send(users);
};

/**
 * User reset password from forgot password email.
 */
exports.resetPassword = async (req, res) => {
    let userId = req.params.userId;
    let code = req.params.code;
    let newPassword = req.params.newPassword;

    if (!code || !userId || !newPassword) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid params."))]});
    }

    let salt = code.split('$')[0];
    let checkCode = Utils.generatePassword(userId + jwtSecret, salt, 'hex');

    if (checkCode !== code) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid reset code."))]});
    }

    let hashPassword = Utils.generatePassword(newPassword);
    let user = await UserModel.update(userId, {password: hashPassword});

    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during updating password."))]});
    }

    // Redirect to EWrist Change Password Page
    return res.redirect(`${process.env.web_url}/login#require-change-password`);
};

exports.list = async (req, res) => {
    let limit = req.query.limit;
    let page = req.query.page;
    let role = req.query.role;
    if (role) {
        role = role.split(',');
    }
    let result = await UserModel.list(role, limit, page);

    return res.status(200).send(result);
};

exports.search = async (req, res) => {
    let limit = req.query.limit;
    let page = req.query.page;
    let search = req.query.search;

    let result = await UserModel.search(limit, page, search);

    return res.status(200).send(result);
};

exports.getById = async (req, res) => {
    let userInfo = await UserInfoModel.findByUserId(req.params.userId);
    let user = await UserModel.findById(req.params.userId);

    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("User not found."))]});
    }

    Utils.responseUser(user);
    return res.status(200).send({user, userInfo});
};

exports.changePassword = async (req, res) => {

    let user = await UserModel.findById(req.params.userId);
    if (user) {
        let salt = user.get('password').split('$')[0];
        let checkNewPassword = Utils.generatePassword(req.body.password, salt);
        if (checkNewPassword === user.get('password')) {
            return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("New password shouldn\'t be similar with the current."))]});
        }
    }

    let newPassword = Utils.generatePassword(req.body.password);

    user = await UserModel.update(req.params.userId, {password: newPassword});

    if (!user) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("An unexpected error occured during updating password."))]});
    }

    return res.status(200).send({msg: res.__("Update succeeded!")});
}

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(200).send({msg: res.__("Delete succeeded!")});
        });
};
