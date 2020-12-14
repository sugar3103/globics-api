const crypto = require('crypto')
const url = require('url')
const constants = require('./constants')
const moment = require('moment')

const algorithm = process.env.algorithm
const secret = process.env.secret

exports.hash = (password, salt = null, digest = null) => {
  salt = salt || crypto.randomBytes(16).toString('base64')
  const hash = crypto
    .createHmac('sha512', salt)
    .update(password)
    .digest(digest || 'base64')
  return hash
}

exports.generatePassword = (password, salt = null, digest = null) => {
  salt = salt || crypto.randomBytes(16).toString(digest || 'base64')
  const hash = this.hash(password, salt, digest)
  return salt + '$' + hash
}

/**
 *
 * @param { string || object } data
 */
exports.encryptResetCode = (data) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv)
  let encrypted = cipher.update(data)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
}

/**
 *
 * @param { string || object } data
 */
exports.decryptResetCode = (hash) => {
  const iv = Buffer.from(hash.iv, 'hex')
  const encryptedText = Buffer.from(hash.encryptedData, 'hex')
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secret),
    iv
  )
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()]).toString()
  return JSON.parse(decrypted)
}

exports.checkResetToken = (code) => {
  const iv = code.split('-')[0]
  const encryptedData = code.split('-')[1]
  const decrypted = this.decryptResetCode({ iv, encryptedData })
  const isExpired = moment().isAfter(decrypted.expired)
  return { decrypted, isExpired }
}

exports.fullUrl = (req) => {
  const originalUrl = req.originalUrl

  return url.format({
    protocol: 'https',
    host: req.get('host'),
    pathname: originalUrl
  })
}

exports.buildErrorMsg = (msg, errorCode = null) => {
  const err = { msg: msg }
  if (errorCode) {
    err.code = errorCode
  }
  return err
}

exports.buildErrorResponse = (
  msg,
  errorCode = constants.ERROR_CODE.UNKNOWN
) => {
  const errors = [this.buildErrorMsg(msg)]
  return {
    code: errorCode,
    errors
  }
}

exports.buildDataResponse = ({
  data = {},
  msg = '',
  options = {},
  code = constants.SUCCESS_CODE.SUCCESS
}) => {
  return {
    code,
    msg,
    data,
    ...options
  }
}

exports.buildResponseObj = (bookshelfObj, keys) => {
  for (const key in bookshelfObj.attributes) {
    if (keys.indexOf(key) < 0) {
      bookshelfObj.set(key, undefined)
    }
  }
}

exports.formatResponseArr = (arr) => {
  if (this.isEmptyOrNull(arr) || arr.length === 0) {
    arr = null
  }
  return { data: arr }
}

exports.responseUser = (user) => {
  this.buildResponseObj(user, [
    'id',
    'first_name',
    'last_name',
    'email',
    'activated_at',
    'created_at'
  ])
}

exports.isEmptyOrNull = (obj) => {
  if (!obj) return true

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

exports.timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

exports.isObject = (obj) => {
  return obj === Object(obj)
}
