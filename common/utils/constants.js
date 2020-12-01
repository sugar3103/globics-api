const constants = {}
constants.STORAGE_URL = 'https://storage.googleapis.com'

constants.role = {
  USER: 0,
  QA: 1,
  DEV: 2,
  SUPER_USER: 98,
  ADMIN: 99
}

constants.accessTokenExprireIn = '30d'
constants.supportedImages = ['jpg', 'jpeg', 'png']

constants.DATE_REGEX = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/
constants.TIME_REGEX = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
constants.ISODATETIME_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
constants.ISODATETIME_000Z_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.000Z/
constants.DATETIME_REGEX = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])$/
constants.DATE_FORMAT = 'YYYY-MM-DD'
constants.DATETIME_FORMAT = 'YYYY-MM-DD HH:mm'
constants.GOALS = ['S', 'C', 'F', 'D', 'E', 'W', 'Z', 'M']
constants.UTC_TIME_ZONE = 'Etc/GMT'

constants.BMI_AVERAGE = (24.9 + 18.5) / 2

constants.numOfWeekPerYear = 52

constants.SUCCESS_CODE = {
  SUCCESS: 200
}

constants.ERROR_CODE = {
  UNKNOWN: 399,
  INVALID: 300,
  SAVE_ERROR: 301,
  EMAIL_NO_EXISTS: 302,
  BODY_FIELD_ERROR: 303,
  PERMISSION_DENIED: 304,
  ACCOUNT_NOT_ACTIVE: 305,
  USER_NOT_FOUND: 306,
  EMAIL_USED: 307,
  ACCOUNT_NOT_MATCH: 308,
  SAME_CURRENT_PASSWORD: 309
}

constants.START_TIME_STRING = '00:00:00.001'
constants.END_TIME_STRING = '24:00:00.000'

constants.SOCIAL_NETWORK_LOGIN_TYPE = {
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  GOOGLE: 'google'
}
module.exports = constants
