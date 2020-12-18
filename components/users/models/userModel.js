const { bookshelf } = database
const { UserInfo } = require('./userInfoModel')
const RESPONSE_USER_COLUMNS = ['id', 'first_name', 'last_name', 'email', 'role', 'activated_at', 'fcm_token', 'last_login_at', 'created_at', 'updated_at']
const Utils = require('../../../utils/allUtils')
const Mailer = require('../../../utils/mailer')

exports.User = bookshelf.Model.extend({
  tableName: 'user',
  hasTimestamps: true,
  userInfo () {
    return this.hasOne(UserInfo)
  }
})

exports.findById = async (userId) => {
  return await this.User.where({ id: userId, deleted_at: null }).fetch({ require: false })
}

exports.findByEmail = async (email) => {
  return await this.User.where({ email: email.toLowerCase(), deleted_at: null }).fetch({ require: false })
}

exports.findBySocialID = async (id) => {
  try {
    return await this.User.where({ social_id: id, deleted_at: null }).fetch()
  } catch (e) {
    return null
  }
}

exports.list = async (role, pageSize = 1000000, page = 1) => {
  const query = this.User
    .where('deleted_at', null)
    .whereNotNull('activated_at')
  if (role) {
    query.andWhere('role', 'IN', role)
  }

  const data = await query.fetchPage({
    pageSize: pageSize,
    page: page,
    withRelated: ['userInfo'],
    columns: RESPONSE_USER_COLUMNS
  })
  const total = data.pagination.rowCount

  return { total, data }
}

exports.search = async (pageSize = 1000000, page = 1, search) => {
  if (Utils.isEmptyOrNull(search) || Utils.isEmptyOrNull(search.trim())) {
    return await this.list(null, pageSize, page)
  }

  let keywords = search.toLowerCase().trim().split(' ')
  keywords = keywords.filter(function (el) {
    return el != null & el.length > 0
  })

  const query = this.User.where({ deleted_at: null }).whereNotNull('activated_at')
  if (keywords.length == 1) {
    const keyword = keywords[0]
    query.andWhere(function () {
      this.andWhere('first_name', 'LIKE', `${keyword}%`)
        .orWhere('last_name', 'LIKE', `${keyword}%`)
        .orWhere('email', 'LIKE', `${keyword}%`)
    })
  } else {
    query.andWhere(function () {
      this.andWhere('first_name', 'LIKE', `${keywords[0]}%`)
        .andWhere('last_name', 'REGEXP', keywords.join('|'))
    })
  }

  const data = await query.fetchPage({
    pageSize: pageSize,
    page: page,
    withRelated: ['userInfo'],
    columns: RESPONSE_USER_COLUMNS
  })
  const total = data.pagination.rowCount

  return { total, data }
}

exports.create = async (userData, avatar = null) => {
  try {
    const user = await this.User.forge({
      email: userData.email.toLowerCase(),
      created_at: new Date()
    }).save()
    UserInfo.forge({
      user_id: user.id
    }).save(null, { method: 'insert' })
    return user
  } catch (err) {
    return null
  }
}

exports.update = async (id, userData) => {
  let user = await this.findById(id)
  if (!user) {
    return null
  }

  for (const [key, value] of Object.entries(userData)) {
    user.set(key, value)
  }

  try {
    user = await user.save()
    return user
  } catch (err) {
    console.error(err)
    return null
  }
}

exports.removeById = async (id) => {
  const user = await this.User.forge({ id: id }).save({ deleted_at: new Date() }, { patch: true })
  UserInfo.where({ user_id: user.id }).save({ deleted_at: new Date() }, { patch: true })
  console.info('Removed user_id: ' + id)
  return user
}

exports.userByIdList = async (listId, selectOption = ['id as user_id', 'first_name', 'last_name', 'email', 'activated_at']) => {
  return await this.User.where('id', 'in', listId)
    .select(selectOption).fetchAll()
}

exports.findAccount = async (first_name, last_name, birth_date) => {
  try {
    return await this.User.query(fqb => {
      fqb.join('user_info', 'user_info.user_id', 'user.id')
    }).where('first_name', 'like', `${first_name}%`)
      .andWhere('last_name', 'like', `${last_name}%`)
      .andWhere({ birth_date: birth_date || null, 'user.deleted_at': null })
      .whereNotNull('activated_at')
      .fetchAll({ columns: ['email', 'first_name', 'last_name'] })
  } catch (e) {
    logger.error(e)
    return null
  }
}

exports.genTokenOrNumberEmail = (req, res, user, isReset) => {
  if (isReset) {
    const expired = moment().add(5, 'minutes')
    const encrypted = Utils.encryptResetCode(
      JSON.stringify({ expired, user })
    )
    const serverName = req.headers.host.split(':')[0]
    const resetLink = `http://${serverName}:3000/users/${encrypted.iv}-${encrypted.encryptedData}`

    Mailer.sendResetPasswordEmail(req, user, resetLink)
  } else {
    const ranNumForUser = Utils.ranNum(4)
    const updateUser = this.update(user.id, { passcode: ranNumForUser })
    if (updateUser) {
      setImmediate(() => Mailer.sendSignUpInEmail(req, user, ranNumForUser))
    } else res.status(200).send(Utils.buildErrorResponse({ msg: res.__('error update user') }))
  }

  return res.status(200).send(
    Utils.buildDataResponse({
      msg: res.__(
        'We have sent you an email, please follow the instruction in it.'
      )
    })
  )
}
