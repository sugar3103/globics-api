exports.convertFloatToInt = (number, round = 1000000) => {
  return Math.round(number * round)
}

exports.parseBoolean = (value) => {
  return !!JSON.parse(String(value).toLowerCase())
}

exports.randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

exports.round = function (num, dp = 2) {
  const numToFixedDp = Number(num).toFixed(dp)
  return Number(numToFixedDp)
}
