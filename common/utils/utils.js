const crypto = require('crypto')
const url = require('url')
const constants = require('./constants')

exports.hash = (password, salt = null, digest = null) => {
  salt = salt || crypto.randomBytes(16).toString('base64')
  const hash = crypto.createHmac('sha512', salt).update(password).digest(digest || 'base64')
  return hash
}

exports.generatePassword = (password, salt = null, digest = null) => {
  salt = salt || crypto.randomBytes(16).toString(digest || 'base64')
  const hash = this.hash(password, salt, digest)
  return salt + '$' + hash
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

exports.buildErrorResponse = (msg, errorCode = constants.ERROR_CODE.UNKNOWN) => {
  const errors = [this.buildErrorMsg(msg)]
  return {
    code: errorCode,
    errors
  }
}

exports.buildDataResponse = ({ data = {}, msg = '', options = {}, code = constants.SUCCESS_CODE.SUCCESS }) => {
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
  this.buildResponseObj(user, ['id', 'first_name', 'last_name', 'email', 'activated_at', 'created_at', 'activity_status'])
}

exports.isEmptyOrNull = (obj) => {
  if (!obj) return true

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) { return false }
  }
  return true
}

exports.timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

exports.isObject = (obj) => {
  return obj === Object(obj)
}
