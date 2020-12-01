const Utils = require('../../../utils/allUtils')

exports.uploadFile = async (req, res) => {
  try {
    return res.status(200).send({ url: 'not working now' })
  } catch (error) {
    return res.status(200).send({ errors: [Utils.buildErrorMsg(error)] })
  }
}
