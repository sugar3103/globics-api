const crypto = require('crypto');
const url = require('url');

exports.hash = (password, salt=null, digest=null) => {
    salt = salt || crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(password).digest(digest || 'base64');
    return hash;
};

exports.generatePassword = (password, salt=null, digest=null) => {
    salt = salt || crypto.randomBytes(16).toString(digest || 'base64');
    let hash = this.hash(password, salt, digest);
    return password = salt + "$" + hash;
}

exports.fullUrl = (req) => {
  let originalUrl = req.originalUrl;
  
  return url.format({
    protocol: 'https',
    host: req.get('host'),
    pathname: originalUrl
  });
}

exports.buildErrorMsg = (msg, errorCode=null) => {
  let err = {msg: msg};
  if (errorCode) {
    err.code = errorCode;
  }
  return err;
}

exports.buildResponseObj = (bookshelfObj, keys) => {
  for (let key in bookshelfObj.attributes) {
    if (keys.indexOf(key) < 0) {
        bookshelfObj.set(key, undefined);
    }
  }
}

exports.formatResponseArr = (arr) => {
  if (this.isEmptyOrNull(arr) || arr.length == 0) {
    arr = null;
  }
  return {data: arr};
}

exports.responseUser = (user) => {
  this.buildResponseObj(user, ['id', 'first_name', 'last_name', 'email', 'activated_at', 'created_at', 'activity_status']);
}

exports.isEmptyOrNull = (obj) => {
  if (!obj) return true;

  for(let key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

exports.timeout = (ms) =>{
  return new Promise(resolve => setTimeout(resolve, ms));
};

exports.isObject = (obj) => {
  return obj === Object(obj);
}