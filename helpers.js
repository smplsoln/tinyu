
/**
 * TinyU helper functions
 */

/**
 * Generate random string of given length
 * @param {String} strLen : length of the generated string
 * @returns : a random string of length strLen
 */
const generateRandomString = (strLen) => {
  let charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charSetLen = charSet.length;
  let rndmStr = '';
  for (let i = 0; i < strLen; i++) {
    rndmStr += charSet.charAt(Math.floor(Math.random() * charSetLen));
  }
  return rndmStr;
};

/**
 * Get the user record which has the given email address.
 * @param {String} email : Email address to be searched
 * @param {UsersStore} users : Reference to the users store
 * @returns : User record containing matching email address
 */
const getUserForEmail = (email, users) => {
  for (const uid of Object.keys(users)) {
    if (users[uid].email === email) {
      return users[uid];
    }
  }
  return;
};

/**
 * Find the url records for the user
 * @param {String} userId : the user Id of the user whose urls are to be searched
 * @param {*} urlDbObj : The reference to the urls store
 * @returns : The URLs for the given user Id
 */
const getUrlsForUserId = (userId, urlDbObj) => {
  const urlsForUser = {};
  for (const short of Object.keys(urlDbObj)) {
    const urlObj = urlDbObj[short];
    if (urlObj.userId === userId) {
      urlsForUser[short] = urlObj;
    }
  }
  return urlsForUser;
};


module.exports = { generateRandomString, getUserForEmail, getUrlsForUserId };