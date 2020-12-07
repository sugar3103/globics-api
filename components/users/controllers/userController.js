const UserModel = require('../models/userModel');
const moment = require('moment');
const UserInfoModel = require('../models/userInfoModel');
const Utils = require('../../../utils/allUtils');
const Mailer = require('../../../utils/mailer');
const shortid = require('shortid');
const constants = require('../../../common/utils/constants');
const url = require('url');
const { checkResetToken } = require('../../../utils/allUtils');

const jwtSecret = process.env.jwt_secret;

/**
 * Register user
 */
exports.create = async (req, res) => {
    req.body.password = Utils.generatePassword(req.body.password);
    req.body.permissionLevel = 1;
    const user = await UserModel.create(req.body);
    if (!user) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('An unexpected error occurred during saving user.'),
                    constants.ERROR_CODE.SAVE_ERROR,
                ),
            );
    }
    setImmediate(() => {
        Mailer.sendActivationEmail(req, user);
    });
    Utils.responseUser(user);
    return res.status(201).send(Utils.buildDataResponse({ data: user }));
};

/**
 * Resent Activation Email
 */

exports.resentActivationEmail = async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);
    if (!user) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('User not found!'),
                    constants.ERROR_CODE.USER_NOT_FOUND,
                ),
            );
    }
    setImmediate(() => {
        Mailer.sendActivationEmail(req, user);
    });
    return res
        .status(201)
        .send(Utils.buildDataResponse({ msg: res.__('Sent succeeded!') }));
};

/**
 * Active account after registered
 */
exports.activate = async (req, res) => {
    const userId = req.params.userId;
    const code = req.params.code;

    if (!code || !userId) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('Invalid params.'),
                    constants.ERROR_CODE.INVALID,
                ),
            );
    }

    const salt = code.split('$')[0];
    const checkCode = Utils.generatePassword(userId + jwtSecret, salt, 'hex');

    if (checkCode !== code) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('Invalid activation code.'),
                    constants.ERROR_CODE.INVALID,
                ),
            );
    }

    const user = await UserModel.update(userId, { activated_at: new Date() });

    if (!user) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('An unexpected error occured during updating user.'),
                    constants.ERROR_CODE.SAVE_ERROR,
                ),
            );
    }

    const agent = req.headers['user-agent'];
    if (agent.includes('Android')) {
        return res.redirect(
            'intent://activate#Intent;scheme=globics;package=com.app.globics;end',
        );
    } else if (agent.includes('iPhone')) {
        return res.redirect('globics://activate');
    } else {
        return res.redirect(`${process.env.web_url}`);
    }
};

exports.verifyEmail = async (req, res) => {
    const userId = req.params.userId;
    const email = req.params.email;
    const code = req.params.code;

    const salt = code.split('$')[0];
    const checkCode = Utils.generatePassword(
        userId + email + jwtSecret,
        salt,
        'hex',
    );
    if (checkCode != code) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('Invalid verification code.'),
                    constants.ERROR_CODE.INVALID,
                ),
            );
    }
    const existedEmail = await UserModel.findByEmail(email);
    if (existedEmail)
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('Email already in use'),
                    constants.ERROR_CODE.EMAIL_USED,
                ),
            );
    UserModel.update(userId, { email: email });

    return res.status(200).send(
        Utils.buildDataResponse({
            msg: res.__('Your email has been updated successfully!'),
        }),
    );
};

/**
 * Send email when forgot password
 * @param { email : string } req
 */
exports.sendResetPasswordToken = async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findByEmail(email);

    if (!user) {
        return res
            .status(302)
            .send(
                Utils.buildErrorResponse(
                    res.__("E-mail doesn't exist."),
                    constants.ERROR_CODE.EMAIL_NO_EXISTS,
                ),
            );
    } else {
        const expired = moment().add(5, 'minutes');
        const userData = JSON.stringify({ expired, user });
        const encrypted = Utils.encryptResetCode(JSON.stringify(userData));
        const resetLink = `http://${req.get(
            'host',
        )}/api/users/check-reset-code/${encrypted.iv}-${
            encrypted.encryptedData
        }`;
        Mailer.sendResetPasswordEmail(req, user, resetLink);
        return res.status(200).send(
            Utils.buildDataResponse({
                msg: 'We have sent you an email to reset your password.',
            }),
        );
    }
};

/**
 * Check valid of reset code
 * @param {code: string} req
 */
exports.checkResetPasswordCode = (req, res) => {
    const { code } = req.params;

    return res.status(200).send(
        Utils.buildDataResponse({
            msg: { isExpired: checkResetToken(code).isExpired },
        }),
    );
};

/**
 * User reset password from forgot password email.
 * @param { code : string } req.body
 * @param { newPassword : string } req.body
 */
exports.resetPassword = async (req, res) => {
    const { code, newPassword } = req.body;
    const decryptedData = checkResetToken(code);
    const { decrypted, isExpired } = decryptedData;

    if (!code || !newPassword) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('Invalid params.'),
                    constants.ERROR_CODE.INVALID,
                ),
            );
    } else if (!isExpired) {
        const hashPassword = Utils.generatePassword(newPassword);
        const user = await UserModel.update(decrypted.user.id, {
            password: hashPassword,
        });
        if (!user) {
            return res
                .status(200)
                .send(
                    Utils.buildErrorResponse(
                        res.__(
                            'An unexpected error occured during updating password.',
                        ),
                        constants.ERROR_CODE.SAVE_ERROR,
                    ),
                );
        } else
            return res.status(200).send(
                Utils.buildDataResponse({
                    msg: { success: 'Update user password successed' },
                }),
            );
    } else
        return res
            .status(301)
            .send(
                Utils.buildErrorResponse(
                    res.__('Reset code expired'),
                    constants.ERROR_CODE.SAVE_ERROR,
                ),
            );
};

exports.list = async (req, res) => {
    const limit = req.query.limit;
    const page = req.query.page;
    let role = req.query.role;
    if (role) {
        role = role.split(',');
    }
    const result = await UserModel.list(role, limit, page);

    return res.status(200).send(Utils.buildDataResponse({ data: result }));
};

exports.search = async (req, res) => {
    const limit = req.query.limit;
    const page = req.query.page;
    const search = req.query.search;

    const result = await UserModel.search(limit, page, search);

    return res.status(200).send(Utils.buildDataResponse({ data: result }));
};

exports.getById = async (req, res) => {
    const userInfo = await UserInfoModel.findByUserId(req.params.userId);
    const user = await UserModel.findById(req.params.userId);

    if (!user) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__('User not found.'),
                    constants.ERROR_CODE.USER_NOT_FOUND,
                ),
            );
    }

    Utils.responseUser(user);
    return res.status(200).send(
        Utils.buildDataResponse({
            data: { user: { ...user.toJSON(), userInfo } },
        }),
    );
};

exports.changePassword = async (req, res) => {
    let user = await UserModel.findById(req.params.userId);
    if (user) {
        const salt = user.get('password').split('$')[0];
        const checkNewPassword = Utils.generatePassword(
            req.body.password,
            salt,
        );
        if (checkNewPassword === user.get('password')) {
            return res
                .status(200)
                .send(
                    Utils.buildErrorResponse(
                        res.__(
                            "New password shouldn't be similar with the current.",
                        ),
                        constants.ERROR_CODE.SAME_CURRENT_PASSWORD,
                    ),
                );
        }
    }

    const newPassword = Utils.generatePassword(req.body.password);

    user = await UserModel.update(req.params.userId, { password: newPassword });

    if (!user) {
        return res
            .status(200)
            .send(
                Utils.buildErrorResponse(
                    res.__(
                        'An unexpected error occured during updating password.',
                    ),
                    constants.ERROR_CODE.SAVE_ERROR,
                ),
            );
    }

    return res
        .status(200)
        .send(Utils.buildDataResponse({ msg: res.__('Update succeeded!') }));
};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId).then((result) => {
        res.status(200).send(
            Utils.buildDataResponse({ msg: res.__('Delete succeeded!') }),
        );
    });
};
