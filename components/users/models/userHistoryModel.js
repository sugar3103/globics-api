const {bookshelf} = database;
const Utils = require("../../../utils/allUtils");
const moment = require('moment');

exports.UserHistory = bookshelf.Model.extend({
    tableName: 'user_history',
    hasTimestamps: true,
})

exports.updateWeight = async (userId, value, date=new Date()) => {
    let query = this.UserHistory.where({
        'user_id': userId,
        'type': 'Weight'
    });
    query.andWhere(bookshelf.knex.raw("DATE(created_at)"), Utils.dateString(date));

    let weight = await query.fetch();

    try {
        // Insert
        if (!weight) {
            weight = await this.UserHistory.forge({
                user_id: userId,
                type: 'Weight',
                value: value,
                created_at: date
            }).save();
        }
        // Update
        else {
            weight.set('value', value);
            weight = await weight.save();
        }

        return weight;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

exports.createOrUpdate = async (userId, type, value, forceInsert=true) => {
    let history = null;
    if (!forceInsert) {
        history = await this.UserHistory.where({
            'user_id': userId,
            'type': type
        }).fetch();
    }

    try {
        // Insert
        if (!history) {
            history = await this.UserHistory.forge({
                user_id: userId,
                type: type,
                value: value
            }).save();
        }
        // Update
        else {
            history.set('value', value);
            history = await history.save();
        }

        return history;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

exports.historyByType = async (userId, type) => {
    let history = await this.UserHistory.where({ 'user_id': userId, 'type': type }).fetch();
    return history;
}


exports.previousWeight = async (userId, date) => {
    let weight = await this.UserHistory
                .where({ 'user_id': userId })
                .andWhere(bookshelf.knex.raw("DATE(created_at)"), '<=', date)
                .andWhere({type: 'Weight'})
                .orderBy('-created_at')
                .fetch({
                    columns: [bookshelf.knex.raw(`DATE_FORMAT(created_at, '%Y-%m-%d') as date`), bookshelf.knex.raw('value-0 as value')]
                });

    return weight;
}

exports.nextWeight = async (userId, date) => {
    let weight = await this.UserHistory
                .where({ 'user_id': userId })
                .andWhere(bookshelf.knex.raw("DATE(created_at)"), '>=', date)
                .andWhere({type: 'Weight'})
                .orderBy('created_at')
                .fetch({
                    columns: [bookshelf.knex.raw(`DATE_FORMAT(created_at, '%Y-%m-%d') as date`), bookshelf.knex.raw('value-0 as value')]
                });

    return weight;
}

exports.weightByEachDay = async (userId, fromDate, toDate=fromDate) => {
    let currentDate = Utils.dateString();
    if (fromDate > currentDate) return [];

    let histories = await this.UserHistory
        .where({ 'user_id': userId })
        .andWhere(bookshelf.knex.raw("DATE(created_at)"), '>=', fromDate)
        .andWhere(bookshelf.knex.raw("DATE(created_at)"), '<=', toDate)
        .andWhere({type: 'Weight'})
        .orderBy('created_at')
        .fetchAll({
            columns: [bookshelf.knex.raw(`DATE_FORMAT(created_at, '%Y-%m-%d') as date`), bookshelf.knex.raw('value-0 as value')]
        });

    if (!histories || histories.length == 0) {
        let result = [];
        let estimateFromWeight = await this.estimateWeightOfDate(userId, fromDate);
        if (estimateFromWeight) result.push(estimateFromWeight);

        let currentDate = Utils.dateString();
        if (toDate > currentDate) toDate = currentDate;

        let estimateToWeight = await this.estimateWeightOfDate(userId, toDate);
        if (estimateToWeight && toDate != fromDate) result.push(estimateToWeight);

        return result;
    }

    if (histories.length > 0) {

        histories = histories.toJSON();

        let firstWeight = histories[0];

        if (firstWeight.date > fromDate) {

            let estimateWeight = await this.estimateWeightOfDate(userId, fromDate);
            if (estimateWeight) histories.unshift(estimateWeight);
        }

        let lastWeight = histories[histories.length-1];

        let currentDate = Utils.dateString();
        if (toDate < currentDate) currentDate = toDate;

        if (lastWeight.date < currentDate) {
            let estimateWeight = await this.estimateWeightOfDate(userId, currentDate);
            if (estimateWeight) histories.push(estimateWeight);
        }

    }

    return histories;
}

exports.estimateWeightOfDate = async (userd, date) => {
    let previousWeight = await this.previousWeight(userd, date);
    if (!previousWeight) {
        return null;
    }

    let nextWeight = await this.nextWeight(userd, date);
    if (!nextWeight) {
        return {date: date, value: previousWeight.get('value')};
    }

    let weightDiff = nextWeight.get('value') - previousWeight.get('value');
    let daysDiff = Utils.numberOfDays(previousWeight.get('date'), nextWeight.get('date'));
    let daysDiffUntilFirstDay = Utils.numberOfDays(previousWeight.get('date'), date);

    let result = previousWeight.get('value') + weightDiff*daysDiffUntilFirstDay/daysDiff;

    return {date: date, value: result};
}

exports.averageWeight = async (userId, fromDate, toDate) => {
    let weightByEachDay = await this.weightByEachDay(userId, fromDate, toDate);

    if(!weightByEachDay || weightByEachDay.length == 0) return 0;


    let first = weightByEachDay[0].date;
    let last = weightByEachDay[weightByEachDay.length-1].date;

    let total = 0;
    let count = Utils.numberOfDays(first, last);
    for(let index = 0; index < weightByEachDay.length; index++){
        const firstItem = weightByEachDay[index];
        const secondItem = weightByEachDay[index + 1];
        let days = secondItem != null ? Utils.numberOfDays(firstItem.date, secondItem.date) : 1;
        let value = 0;
        //Because Utils.numberOfDays return diff + 1;
        if(days > 2 && secondItem != null){
            value = (firstItem.value + secondItem.value)/2;
            total += value * days - secondItem.value;
        } else {
            total += firstItem.value;
        }
    }
    return count !== 0 ? total/count : 0;
};

exports.listWeightData = async (userId, fromDate, toDate) => {
    return await this.UserHistory
      .where({ 'user_id': userId })
      .andWhere(bookshelf.knex.raw("DATE(created_at)"), '>=', fromDate)
      .andWhere(bookshelf.knex.raw("DATE(created_at)"), '<=', toDate)
      .andWhere({type: 'Weight'})
      .orderBy('created_at')
      .fetchAll({
          columns: [bookshelf.knex.raw(`DATE_FORMAT(created_at, '%Y-%m-%d') as date`), bookshelf.knex.raw('value-0 as value')]
      });
};
