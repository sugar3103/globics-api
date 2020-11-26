const fetch = require('node-fetch');
const UserModel = require('../../users/models/userModel');
const Utils = require('../../../utils/allUtils');
const constants = require('../../../common/utils/constants');

exports.processSocialLoginToken = async (req, res, next) => {
    let token = req.body.token;
    let type = req.body.type;
    let data = {};
    let url;
    switch (type){
        case constants.SOCIAL_NETWORK_LOGIN_TYPE.APPLE:
            data = {
                id: req.body.id,
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            }
            break;
        case constants.SOCIAL_NETWORK_LOGIN_TYPE.GOOGLE:
            url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
            break;
        case constants.SOCIAL_NETWORK_LOGIN_TYPE.FACEBOOK:
            url = `https://graph.facebook.com/v8.0/me?fields=id,name,first_name,last_name,email&access_token=${token}`;
    }

    if(url){
        let socialData;
        const result = await fetch(url,
            {
                method: 'GET'
            });
        socialData = await result.json();
        if (!socialData || socialData.error) {
            return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid token."))]});
        }
        data = {...data, ...socialData};
    }

    const getAvatarFromSocialData = (_socialData, type) => {
        if(type === constants.SOCIAL_NETWORK_LOGIN_TYPE.GOOGLE) return _socialData.picture;
        else if(type === constants.SOCIAL_NETWORK_LOGIN_TYPE.FACEBOOK)
            return `https://graph.facebook.com/${_socialData.id}/picture?width=256`
        return null;
    }
    
    let user = data.email ?  await UserModel.findByEmail(data.email) : await UserModel.findBySocialID(data.id);
    // Auto register a new user based on socical data
    if (!user) {
        let email = data.email || 'N/A';
        let avatar = getAvatarFromSocialData(data, type);
        let first_name = data.given_name || data.first_name || '';
        let last_name  = data.family_name || data.last_name || '';
        let password = type;
        let activated_at = new Date();
        let social_id = data.id;
        let userData = {first_name, last_name, email, social_id, password, activated_at};
        user = await UserModel.create(userData, avatar);        
    }

    // Check activated for security reason.
    if (!user.get('activated_at')) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Your account has not been activated. Please check your email then activate your account."))]});
    }

    req.body = {
        userId: user.get('id'),
        email: user.get('email'),
        role: user.get('role'),
        provider: 'email',
        name: user.get('first_name') + ' ' + user.get('last_name'),
        first_name: user.get('first_name'),
        last_name: user.get('last_name')
    };
    return next();
}

exports.isPasswordAndUserMatch = async (req, res, next) => {
    let user = await UserModel.findByEmail(req.body.email);
    if(!user){
        res.status(200).send({errors: [Utils.buildErrorMsg(res.__("E-mail doesn\'t exist."))]});
        return;
    }

    let passwordFields = user.get('password').split('$');
    let salt = passwordFields[0];
    let hash = Utils.hash(req.body.password, salt);

    if (hash !== passwordFields[1]) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Invalid email or password."))]});
    }

    if (!user.get('activated_at')) {
        return res.status(200).send({errors: [Utils.buildErrorMsg(res.__("Your account has not been activated. Please check your email then activate your account."))]});
    }



    let userId = user.get('id');
    if (user.get('role') == constants.role.ADMIN && req.body.act_as) {
        userId = req.body.act_as;
    }
    req.body = {
        userId: userId,
        email: user.get('email'),
        role: user.get('role'),
        provider: 'email',
        name: user.get('first_name') + ' ' + user.get('last_name'),
        first_name: user.get('first_name'),
        last_name: user.get('last_name')
    };
    return next();
};