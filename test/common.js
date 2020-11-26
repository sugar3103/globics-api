let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let should = chai.should();
let utils = require('../utils/allUtils');

let server = require('../app');
chai.use(chaiHttp);

var accessToken = null;
var userId = null;

exports.doLogin = async () => {
    let res = await chai.request(server)
        .post('/api/auth')
        .send({
            email: 'apitest1@gmail.com',
            password: '12345678@Ab'
        });

    accessToken = res.body.accessToken;
    userId = res.body.user_info.user_id;

    return {
        accessToken: accessToken,
        userId: userId
    };
}