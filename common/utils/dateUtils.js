const moment = require('moment');
const momenttz = require('moment-timezone');
const constants = require('./constants');

Number.prototype.pad = function (size) {
    let s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

exports.dateString = (datetime = new Date(), format = constants.DATE_FORMAT) => {
    return moment(datetime).format(format);
}

exports.dateStringFromDateTime = (datetime = new Date(), format = constants.DATE_FORMAT, timezone) => {
    return datetime.format(format);
}

exports.dateTimeString = (datetime = new Date()) => {
    return moment(datetime).format('YYYY-MM-DD HH:mm:ss');
}

exports.dateFromString = (dateStr, format = constants.DATE_FORMAT) => {
    return moment(dateStr, format);
}

exports.addDay = function (dateStr, day = 1) {
    let date = this.dateFromString(dateStr);
    date = date.add(day, 'days');
    return this.dateString(date);
}

exports.dateAdd = function (date, value, unit) {
    return moment(date).add(value, unit).toDate();
}

exports.addMonth = function (dateStr, month = 1) {
    let date = this.dateFromString(dateStr);
    date = date.add(month, 'months');
    return this.dateString(date);
}

exports.minutesToTimeString = function (minutes) {
    let hour = (Math.floor(minutes / 60)).pad();
    let min = (minutes % 60).pad();
    return `${hour}:${min}:00`;
}

exports.getDateFromWeek = function (day, week, year) {
    return moment().day(day).year(year).week(week).toDate();
};

exports.numberOfDays = function (from, to) {
    let a = moment(from);
    let b = moment(to);
    let result = b.diff(a, 'days') + 1;

    return Math.abs(result);
}

exports.datesBetweenDates = function (from, to) {
    let result = [];
    let i = from;
    do {
        result.push(i);
        i = this.addDay(i);
    } while (i <= to);

    return result;
}

exports.timeStringToSeconds = function (timeString) {
    return moment.duration(timeString).asSeconds()
}

exports.numOfWeeksBetweenTwoDates = (birthDate, now) => {
    let diff = (now.getTime() - birthDate.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);
    return Math.abs(Math.round(diff));
}

exports.firstDateOfMonth = (month, year) => {
    return `${year}-${month.pad()}-01`;
}

exports.lastDateOfMonth = (month, year) => {
    let yearMonth = `${year}-${month.pad()}`;
    let numberOfDays = moment(yearMonth, "YYYY-MM").daysInMonth();
    return `${yearMonth}-${numberOfDays}`;
}

exports.isIsoDate = (str) => {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    let d = new Date(str);
    return d.toISOString() === str;
};

exports.convertDateStringToDateTimeWithTimeZone = (dateString, timeString = null, timeZoneId = constants.UTC_TIME_ZONE) => {
    let dateTimeString = timeString ? moment.tz(`${dateString} ${timeString}`, timeZoneId) : moment.tz(dateString, timeZoneId);
    return dateTimeString.tz(constants.UTC_TIME_ZONE).toDate();
};

exports.convertDateTimeStringToDateString = (dateTimeString) => {
    return moment.tz(dateTimeString, constants.UTC_TIME_ZONE).format('YYYY-MM-DD');
};

exports.convertTimestampToDateString = (object, key) => {
    if (object) {
        let d = object.get(key);
        if (d) {
            d = d.toISOString();
            d = d.split("T")[0];
            object.set({ [key]: d });
        }
    }
    return object;
};

exports.newMomentTimezone = (dateString, timeString = constants.START_TIME_STRING, timezone) => {
    let dateTimeString = timeString ? moment.tz(`${dateString} ${timeString}`, timezone) : moment.tz(dateString, timezone);
    return dateTimeString.tz(constants.UTC_TIME_ZONE);
};

exports.calculateAge = (birthday, tilDate=new Date()) => {
    return moment(tilDate).diff(moment(birthday),'years',true);
}