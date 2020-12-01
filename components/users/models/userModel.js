const { bookshelf } = database
const { UserInfo } = require('./userInfoModel')
const RESPONSE_USER_COLUMNS = ['id', 'first_name', 'last_name', 'email', 'role', 'activated_at', 'fcm_token', 'last_login_at', 'created_at', 'updated_at']
const Utils = require('../../../utils/allUtils')

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
      password: userData.password,
      social_id: userData.social_id,
      first_name: userData.first_name,
      last_name: userData.last_name
    }).save()
    UserInfo.forge({
      user_id: user.id,
      avatar: avatar
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
