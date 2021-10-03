

// Generate random string
const generateRandomString = (strLen) => {
  let charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charSetLen = charSet.length;
  let rndmStr = '';
  for (let i = 0; i < strLen; i++) {
    rndmStr += charSet.charAt(Math.floor(Math.random() * charSetLen));
  }
  return rndmStr;
};

const getUserForEmail = (emailAddr, users) => {
  for (const uid of Object.keys(users)) {
    if (users[uid].email === emailAddr) {
      return users[uid];
    }
  }
  return;
};

module.exports = { generateRandomString, getUserForEmail };