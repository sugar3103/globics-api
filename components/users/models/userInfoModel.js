const {bookshelf} = database;
const {User} = require("./userModel");
const UserHistoryModel = require("./userHistoryModel");
const Utils = require("../../../utils/allUtils");

exports.UserInfo = bookshelf.Model.extend({
    tableName: 'user_info',
    hasTimestamps: true,
    idAttribute: 'user_id'
})

exports.update = async (userId, userData) => {
    let userInfo = await this.UserInfo.where({'user_id': userId, 'deleted_at': null}).fetch();

    if (!userInfo) {
        userInfo = this.UserInfo.forge({
            user_id: userId
        });
    }

    for (const [key, value] of Object.entries(userData)) {
        userInfo.set(key, value);
    }

    try {
        userInfo = await userInfo.save();

        if (userData.weight) {
           await UserHistoryModel.updateWeight(userId, userData.weight, userData.updated_at || new Date());
        }

        return userInfo;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
exports.findByUserId = async (userId) => {
    let userInfo = await this.UserInfo.where({'user_id': userId}).fetch();
    userInfo = Utils.convertTimestampToDateString(userInfo, 'birth_date');
    return userInfo;
};
