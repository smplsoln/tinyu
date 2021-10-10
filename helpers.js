


const { RANDOM_STR_LENGTH, SERVER_PORT, HTTP_STATUS,
  APP_URLS, RESOURCES, users, urlDbObj } = require('./constants');

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
 * Check if the given string is a valid URL
 * @param {String} string
 * @returns boolean : true if given string is a valid URL, false otherwise
 *
 * e.g.:
 * URL constructor throws a TypeError if the string is not a valid URL
 *
 * "TypeError [ERR_INVALID_URL]: Invalid URL: www.google.com
 *         at onParseError (internal/url.js:258:9)\n    at new URL
 */
const isValidHttpUrl = function(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
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


// Validate login session
const validateLoginSession = (req, res, showError, errMsg, pageToShow, httpStatusCode) => {
  const userId = req.session.userId;
  // if the userId cookie is not already set
  // then the user is not authenticated, ask to login
  if (!userId) {
    req.session = null;
    if (showError) {
      res.status(httpStatusCode).render(pageToShow, { err: errMsg});
      return;
    }
    // req.session.err = 'Error: Not logged in!';
    res.status(HTTP_STATUS.FORBIDDEN)
      .redirect(APP_URLS.login);
    return false;
  }

  // if the userId cookie is set but the user information
  // is not present then the user is not a valid registered user
  // ask to register
  const user = users[userId];
  if (!user) {
    req.session = null;
    res.status(HTTP_STATUS.FORBIDDEN)
      .render('register', { err: 'Error: Not a valid registered user!' });
    return false;
  }
  // validation successful, carry on
  return true;
};

const validateShortUrl = function(shortURL, userId, res) {
  const urlObj = urlDbObj[shortURL];
  if (!urlObj) {
    const errString = `Error: URL ${shortURL} not found!`;
    sendUrlsList(userId, errString, HTTP_STATUS.FORBIDDEN, res);
    return false;
  }

  if (urlObj.userId !== userId) {
    const errString = `Error: URL ${shortURL} does not belong to user!`;
    sendUrlsList(userId, errString, HTTP_STATUS.FORBIDDEN, res);
    return false;
  }
  return true;
};

const sendUrlsList = function(userId, errString, resStatusCode, res) {
  const user = users[userId];
  // Find the url records for the user
  const urlsForUser = getUrlsForUserId(userId, urlDbObj);

  // Render the urls table
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    urls: urlsForUser,
    username: username,
    err: errString
  };
  res.status(resStatusCode)
    .render("urls_index", templateVars);
};

// process and send the urls list page
const processUrlsList = function(req, res) {

  if (!validateLoginSession(req, res)) {
    return false;
  }

  const errString = "";
  const userId = req.session.userId;
  const resStatusCode = HTTP_STATUS.OK;

  sendUrlsList(userId, errString, resStatusCode, res);
  return true;
};


module.exports = { generateRandomString, getUserForEmail,
  getUrlsForUserId, isValidHttpUrl, validateShortUrl,
  sendUrlsList, processUrlsList, validateLoginSession };