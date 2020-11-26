const FCM = require('fcm-node');
const constants = require('../common/utils/constants');

const pushNotificationAsync = async (token, title, body, type, data) => {
  let fcm = new FCM(process.env.FCM_KEY);

  let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: token,
    priority: 'high',
    content_available: true,
    notification: {
      title: title,
      body: body,
      click_action: 'com.globics.main.MainActivity'
    },
    data: {  //you can send only notification or only data(or include both)
      type: type,
      data: data
    }
  };

  return new Promise((resolve, reject) => {
    fcm.send(message, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
};

exports.pushNotification = async (token, title, body, type, data) => {
  try {
    return await pushNotificationAsync(token, title, body, type, data);
  }catch (e) {
    console.error(e);
    return null;
  }
};

exports.pushNotificationToTopic = (topic='all', title, body, type, data, tokens=[]) => {
  let fcm = new FCM(process.env.FCM_KEY);

  let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: `/topics/${topic}`,
    priority: 'high',
    content_available: true,
    notification: {
      title: title,
      body: body,
      click_action: 'com.globics.main.MainActivity'
    },
    data: {  //you can send only notification or only data(or include both)
      type: type,
      data: data
    }
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.error(err);
    }
    if(topic!=='all' && tokens && tokens.length > 0){
      fcm.unsubscribeToTopic(tokens, topic, function (err, response) {
        if (err) {
          console.error(err);
        }
      })
    }
  });
}

exports.subscribeTopic = (topic='all', tokens) => {
  let fcm = new FCM(process.env.FCM_KEY);
  fcm.subscribeToTopic(tokens, topic, function (err, response) {
    if (err) {
      console.error(err);
    }
  });

};
