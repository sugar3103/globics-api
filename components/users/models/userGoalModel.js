const { bookshelf, knex } = database
const Utils = require('../../../utils/allUtils')

const tableName = 'user_goal'
exports.UserGoal = bookshelf.Model.extend({
  tableName,
  hasTimestamps: true
})

const userGoalByType = (userGoals, type) => {
  if (Utils.isEmptyOrNull(userGoals) || userGoals.length == 0) {
    return null
  }
  for (const userGoal of userGoals) {
    if (userGoal.get('type') === type) {
      return userGoal
    }
  }

  return null
}

exports.update = async (userId, goals, date) => {
  console.debug(`======= Update goal for ${date}`)
  const userGoals = await this.goalsByDate(userId, date)

  const UserGoals = bookshelf.Collection.extend({
    model: this.UserGoal
  })

  let result = null

  try {
    // Create user_goals
    if (userGoals.length === 0) {
      result = await UserGoals.forge(goals).invokeThen('save')
    } else {
      const newGoals = []
      for (const goal of goals) {
        const userGoal = userGoalByType(userGoals, goal.type)
        if (userGoal) {
          userGoal.set('value', goal.value)
          userGoal.set('unit', goal.unit)
          userGoal.set('time_frame', goal.time_frame)
          userGoal.set('created_at', date)
        } else {
          newGoals.push(goal)
        }
      }
      result = await userGoals.invokeMap('save')
      if (newGoals.length > 0) {
        result = await UserGoals.forge(newGoals).invokeThen('save')
      }
    }

    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

exports.insert = async (userId, goals, date) => {
  const UserGoals = bookshelf.Collection.extend({
    model: this.UserGoal
  })

  let result = null

  try {
    result = await UserGoals.forge(goals).insert()

    return result
  } catch (err) {
    console.error(err)
    return null
  }
}

exports.goalsByDate = async (userId, date) => {
  const userGoals = await this.UserGoal.where(bookshelf.knex.raw('DATE(created_at)'), date).andWhere('user_id', userId).fetchAll()
  return userGoals
}

exports.goalsLatestByUserId = async (userId, date) => {
  const query = `WITH ranked_messages AS 
    (SELECT m.*, ROW_NUMBER() OVER (PARTITION BY type) AS rn FROM ${tableName} AS m
        WHERE user_id = ${userId} AND DATE(created_at) <= DATE('${date}')) 
        SELECT * FROM ranked_messages WHERE rn = 1;`
  return knex.raw(query)
}

exports.goalsByUserId = async ({ userId, fromDate, toDate = fromDate, includeLatest = true }) => {
  const query = this.UserGoal
    .where({ user_id: userId })
    .andWhere(bookshelf.knex.raw('DATE(created_at)'), '>=', fromDate)
    .andWhere(bookshelf.knex.raw('DATE(created_at)'), '<=', toDate)

  const userGoals = await query.orderBy('-id').fetchAll()

  // Will work......
  if (includeLatest) {
    const latestGoals = this.goalsLatestByUserId(userId, toDate)

    return latestGoals
  }

  if (userGoals.length > 0) {
    return userGoals
  }

  // // Get latest previous Goals if the current not found.
  // let retryQuery = this.UserGoal
  //     .where({ 'user_id': userId })
  //     .andWhere(bookshelf.knex.raw("DATE(created_at)"), '<=', toDate)
  //     .orderBy('-id')
  //     .limit(constants.GOALS.length);
  // userGoals = await retryQuery.fetchAll();
  //
  // //hotfix for the case missing Meditation goal
  // if (userGoals.length > 0) {
  //     const lastItem = userGoals.pop();
  //     if(!userGoals.some(item => item.get('type') === lastItem.get('type'))){
  //         userGoals.push(lastItem);
  //     }
  // }

  return userGoals
}

// This function returns all goals (from 2019-01-01) of user.
exports.goalsByTypeAndUserId = async (userId, type, fromDate, toDate = fromDate) => {
  let op = null
  if (type === 'Z') {
    op = { columns: [bookshelf.knex.raw('ROUND(value/60, 1) as value'), 'id', 'type', 'user_id', 'unit', 'time_frame', 'created_at'] }
  }
  const query = this.UserGoal.where({ user_id: userId })
    .andWhere({ type: type })
    .andWhere(bookshelf.knex.raw('DATE(created_at)'), '>=', '2019-01-01')
    .andWhere(bookshelf.knex.raw('DATE(created_at)'), '<=', toDate)
    .orderBy('-id') // don't change this orderBy

  const userGoals = await query.fetchAll(op)

  // Process goals, fill out the dates which don't goal.
  // Make sure the query above orderBy('-id').
  const dates = Utils.datesBetweenDates(fromDate, toDate)

  const result = []
  for (const date of dates) {
    const goal = userGoals.find(goal => Utils.dateString(goal.get('created_at')) <= date)

    if (goal) {
      result.push({
        date: date,
        value: goal.get('value'),
        type: goal.get('type'),
        unit: goal.get('unit'),
        time_frame: goal.get('time_frame')
      })
    }
  }

  return result
}

// goals params MUST be from exports.goalsByTypeAndUserId
exports.goalPerDay = (goals, fromDate, toDate) => {
  let value = 0
  let count = 0
  for (const goal of goals) {
    if (goal.date >= fromDate && goal.date <= toDate) {
      value += goal.value
      count++
    }
  }

  return value / count
}

// goals params MUST be from exports.goalsByTypeAndUserId
exports.goalByMonth = (goals, month, year) => {
  let result = 0
  for (const goal of goals) {
    const y = goal.date.split('-')[0] - 0
    const m = goal.date.split('-')[1] - 0

    if (y == year && m == month) {
      let value = goal.value
      if (goal.time_frame == 'W') {
        value = value / 7.0
      }

      result += value
    }
  }

  return result
}

// goals params MUST be from exports.goalsByTypeAndUserId
exports.goalValueByWeek = (goals, week, year) => {
  if (Utils.isEmptyOrNull(goals) || goals.length == 0) {
    return 0
  }

  const fromDate = Utils.dateString(Utils.getDateFromWeek('Sunday', week, year))
  const toDate = Utils.dateString(Utils.getDateFromWeek('Saturday', week, year))

  let value = 0
  let count = 0
  for (const goal of goals) {
    if (goal.date >= fromDate && goal.date <= toDate) {
      value += goal.value
      count++
    }
  }

  return Utils.round(value / count, 0)
}
