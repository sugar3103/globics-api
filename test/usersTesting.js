let chai = require('chai');
let chaiHttp = require('chai-http');
let expect  = chai.expect;
let should = chai.should();
let utils = require('../utils/allUtils');

let server = require('../app');
chai.use(chaiHttp);

var accessToken = null;
var userId = null;

describe('/signin', function(){
  describe('failed', function(){
    it('should return error if email/password not match', function(done) {
      chai.request(server)
          .post('/api/auth')
          .send({
            email: 'apitest1@gmail.com',
            password: '1234567'
          })
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object');
            res.body.should.have.property('errors');
            done();
      });
    });
  });

  describe('success', function(){
    it('should return access token & user info', function(done) {
      chai.request(server)
          .post('/api/auth')
          .send({
            email: 'apitest1@gmail.com',
            password: '12345678@Ab'
          })
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('object');
            res.body.should.have.property('accessToken');
            res.body.should.have.property('refreshToken');
            res.body.should.have.property('user_info');

            accessToken = res.body.accessToken;
            userId = res.body.user_info.user_id;

            done();
      });
    });
    
  });
});

describe('/signup', function(){
  
  describe('success', function(){
    it('should return a user', function(done) {
      chai.request(server)
          .post('/api/users')
          .send({
            first_name: 'api test',
            last_name: 'api test',
            email: `thanh.nguyen+${utils.randomInt(10000, 99999999)}@ncubelabs.com`,
            password: '12345678@Ab'
          })
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('object');
            res.body.should.have.property('first_name');
            res.body.should.have.property('last_name');
            res.body.should.have.property('email');
            res.body.should.have.property('created_at');
            res.body.should.have.property('id');
            done();
      });
    });
    
  });
});

describe('/get users', function(){
  
  describe('success', function(){
    it('should return list of users', function(done) {
      chai.request(server)
          .get('/api/users')
          .set('Authorization', `Bearer ${accessToken}`)
          .query({'limit': 10})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object');
            res.body.should.have.property('total');
            res.body.data.should.have.lengthOf(10);
            done();
      });
    });
    
  });
});

describe('/search users', function(){
  
  describe('success', function(){
    it('should return list of users', function(done) {
      chai.request(server)
          .get('/api/users/search')
          .set('Authorization', `Bearer ${accessToken}`)
          .query({'search': 't', 'limit': 5})
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object');
            res.body.should.have.property('total');
            res.body.data.should.have.lengthOf(5);
            done();
      });
    });
    
  });
});

describe('/get user', function(){
  
  describe('success', function(){
    it('should return a user', function(done) {
      chai.request(server)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object');
            res.body.user.id.should.equal(userId);
            res.body.userInfo.user_id.should.equal(userId);
          
            done();
      });
    });
    
  });
});

describe('/patch user', function(){
  
  describe('success', function(){
    it('should return a user', function(done) {
      chai.request(server)
          .patch(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            first_name: 'test',
            birth_date: '1990-02-23',
            weight: 50000,
            shape: 'G'
          })
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object');
            res.body.user.id.should.equal(userId);
            res.body.user.first_name.should.equal('test');
            res.body.userInfo.user_id.should.equal(userId);
            res.body.userInfo.birth_date.should.equal('1990-02-23');
            res.body.userInfo.weight.should.equal(50000);
          
            done();
      });
    });
    
  });
});

describe('/set goal', function(){
  
  describe('failed', function(){
    it('should NOT allow add invalid goals', function(done) {
      chai.request(server)
          .post(`/api/users/goals`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send([
            {
              "type": "M",
              "value": 480,
              "unit": "H",
              "time_frame": "W",
              "created_at": "2020-04-01"
            },
            {
              "type": "M",
              "value": 480,
              "unit": "H",
              "time_frame": "W",
              "created_at": "2020-04-01"
            }
          ])
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('errors');         
          
            done();
      });
    });
  });

  describe('success', function(){
    it('should return goal', function(done) {
      chai.request(server)
          .post(`/api/users/goals`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send([
            {
              "type": "S",
              "value": 480,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "C",
              "value": 480,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "D",
              "value": 480,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "E",
              "value": 480,
              "time_frame": "W",
              "created_at": "2020-04-01"
            },
            {
              "type": "W",
              "value": 48000,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "Z",
              "value": 480,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "F",
              "value": 48,
              "time_frame": "D",
              "created_at": "2020-04-01"
            },
            {
              "type": "M",
              "value": 480,
              "time_frame": "W",
              "created_at": "2020-04-01"
            }
          ])
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('msg');         
          
            done();
      });
    });
  });
  
});