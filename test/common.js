const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../app')
chai.use(chaiHttp)

let accessToken = null
let userId = null

exports.doLogin = async () => {
  const res = await chai.request(server)
    .post('/api/auth')
    .send({
      email: 'apitest1@gmail.com',
      password: '12345678@Ab'
    })

  accessToken = res.body.accessToken
  userId = res.body.user_info.user_id

  return {
    accessToken: accessToken,
    userId: userId
  }
}
