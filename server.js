/**
 * TinyU Server JS containing all the app server logic
 */

// module imports
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const { generateRandomString, getUserForEmail,
  getUrlsForUserId, isValidHttpUrl, validateShortUrl,
  sendUrlsList, processUrlsList, validateLoginSession } = require('./helpers');

const { RANDOM_STR_LENGTH, SERVER_PORT, HTTP_STATUS,
  APP_URLS, RESOURCES, users, urlDbObj } = require('./constants');

// Init Express app
const app = express();
// middleware inits
app.use(favicon(RESOURCES.favicon));
app.use(express.static('public'));
app.use(morgan('dev'));

// Set ejs as view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'TinyU_session',
  keys: ['secret keys', 'not needed now'],
}));

app.use(methodOverride('_method'));


// response-handler mappings

// GET /register : register new user
app.get(APP_URLS.register, (req, res) => {

  // GET Register is a special case where the user is not
  // expected to be present in the server.
  // So its handling is different to other cases
  const userId = req.session.userId;
  if (!userId) {
    // userId not set in session so send registration page
    res.status(HTTP_STATUS.OK).render('register', { err: "" });
    return;
  }
  // if the userId cookie is already set check if user
  // exists and if in a currently authenticated session
  const user = users[userId];
  if (!user) {
    // no user exists for this userId then send registration page
    // after clearing the session data
    req.session = null;
    res.status(HTTP_STATUS.OK).render('register', { err: "" });
    return;
  }

  // valid session of existing registered user
  // detected so redirect to urls page
  res.status(HTTP_STATUS.REDIRECT).redirect(APP_URLS.urls);
});

// POST /register : Register the new user
app.post(APP_URLS.register, (req, res) => {
  const body = req.body;
  const email = body.email;
  const password = body.password;
  const name = body.name;

  // Validate user inputs

  // check name, email and password was submitted
  if (!email || !password || !name) {
    res.status(HTTP_STATUS.BAD_REQUEST)
      .render('register', { err: 'Error: Name, email and password cannot be blank!' });
    return;
  }

  if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    res.status(HTTP_STATUS.BAD_REQUEST)
      .render('register', { err: 'Error: Invalid email!' });
    return;
  }

  // Check if user already exists for this email
  if (getUserForEmail(email, users)) {
    res.status(HTTP_STATUS.FORBIDDEN).render('register', {
      err: "Error: Invalid registration details! \nUser already registered for this email!"
    });
    return;
  }

  // hash the user's password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      // add new user
      const newUserId = generateRandomString(3);
      users[newUserId] = {
        id: newUserId,
        name: name,
        email: email,
        password: hash
      };

      req.session = null;
      res.status(HTTP_STATUS.ACCEPTED).render('login', { err: "" });
    });
  });
});

// GET login
app.get(APP_URLS.login, (req, res) => {

  const userId = req.session.userId;
  if (!userId) {
    // userId not set in session so send login page
    res.status(HTTP_STATUS.OK).render('login', { err: "" });
    return;
  }
  // if the userId cookie is not already set then the user might already exist
  // and in a currently authenticated session
  const user = users[userId];
  if (!user) {
    // no user exists for this session userId so send login page
    // after clearing the possibly stale/cached session data
    req.session = null;
    res.status(HTTP_STATUS.OK).render('login', { err: "" });
    return;
  }

  // valid session of existing registered user detected so redirect to urls page
  res.status(HTTP_STATUS.REDIRECT).redirect(APP_URLS.urls);
});

// process login and set user_id cookie
app.post(APP_URLS.login, (req, res) => {

  const body = req.body;
  const email = body.email;
  const password = body.password;

  // check email and password was submitted
  if (!email || !password) {
    req.session = null;
    res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Email and password cannot be blank!' });
    return;
  }

  // get the user info for this email
  let user = getUserForEmail(email, users);

  // no user with this email address
  if (!user) {
    req.session = null;
    res.status(HTTP_STATUS.FORBIDDEN)
      .render('register', { err: 'Error: No user with this email address!' });
    return;
  }

  // compare the stored password hash with the user provided password
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      req.session = null;
      // password does not match
      res.status(HTTP_STATUS.FORBIDDEN)
        .render('login', { err: 'Error: Invalid Password!' });
      return;
    }

    if (err) {
      // Such error during bcrypt is never expected
      // So logging the error, but not sending it to user for safety
      console.error({ err });
      req.session = null;
      res.status(HTTP_STATUS.FORBIDDEN)
        .render('login', { err: 'Error during authentication! Enter valid password!' });
      return;
    }

    // User authenticated successfully redirect the user
    req.session.userId = user.id;
    return res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
  });
});

// process logout and unset session cookie
app.post(APP_URLS.logout, (req, res) => {
  req.session = null;
  res.status(HTTP_STATUS.OK).render('login', { err: "" });
});

// GET / handler
app.get(APP_URLS.home, (req, res) => {
  // Process this as a urls list request
  processUrlsList(req, res);
});

// GET /urls : list the urls for the current user
app.get(APP_URLS.urls, (req, res) => {
  // process urls list request
  processUrlsList(req, res);
});

// GET urls addition page
app.get(APP_URLS.urlsNew, (req, res) => {

  if (!validateLoginSession(req, res)) {
    return;
  }

  const userId = req.session.userId;
  const user = users[userId];
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    username: username,
    err: ""
  };

  res.status(HTTP_STATUS.OK).render("urls_new", templateVars);
});

// POST : Add a new URL entry
app.post(APP_URLS.urls, (req, res) => {

  if (!validateLoginSession(req, res)) {
    return;
  }

  const userId = req.session.userId;
  const longURL = req.body.longURL;

  if (!longURL || longURL === "" || !isValidHttpUrl(longURL)) {
    const user = users[userId];
    const username = `${user.name} (${user.email})`;
    const templateVars = {
      username: username,
      err: "Error: Invalid URL input!"
    };
    res.status(HTTP_STATUS.BAD_REQUEST).render("urls_new", templateVars);
    return;
  }

  let newUrlId = generateRandomString(RANDOM_STR_LENGTH);
  urlDbObj[newUrlId] = {
    userId: userId,
    longURL: longURL
  };

  let shortURL = APP_URLS.urls + '/' + newUrlId;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

// GET /urls/:shortURL : show the longURL details for the given shortURL
app.get(APP_URLS.shortUrl, (req, res) => {
  if (!validateLoginSession(req, res)) {
    return;
  }
  const shortURL = req.params.shortURL;
  const userId = req.session.userId;

  if (!validateShortUrl(shortURL, userId, res)) {
    return;
  }
  const user = users[userId];
  const urlObj = urlDbObj[shortURL];
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlObj.longURL,
    username: username,
    err: ""
  };
  res.status(HTTP_STATUS.OK).render("urls_show", templateVars);
});

// PUT /urls/:shortURL : Update the long url of a given short url
app.put(APP_URLS.shortUrl, (req, res) => {

  if (!validateLoginSession(req, res)) {
    return;
  }

  let shortURL = req.params.shortURL;
  const userId = req.session.userId;

  if (!validateShortUrl(shortURL, userId, res)) {
    return;
  }

  const user = users[userId];
  const urlObj = urlDbObj[shortURL];

  const longURL = req.body.longURL;
  if (!longURL || longURL === "" || !isValidHttpUrl(longURL)) {
    const username = `${user.name} (${user.email})`;
    const templateVars = {
      shortURL: shortURL,
      longURL: urlObj.longURL,
      username: username,
      err: "Error: Invalid long URL!"
    };
    res.status(HTTP_STATUS.BAD_REQUEST).render("urls_show", templateVars);
    return;
  }

  urlObj.longURL = longURL;
  shortURL = APP_URLS.urls + '/' + shortURL;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

// DELETE /urls/:shortURL/delete - a url entry having given shortURL
// DELETE /urls/:shortURL?_method=DELETE
app.delete(APP_URLS.deleteUrl, (req, res) => {

  if (!validateLoginSession(req, res)) {
    return;
  }

  const userId = req.session.userId;
  let shortURL = req.params.shortURL;

  if (!validateShortUrl(shortURL, userId, res)) {
    return;
  }

  // All good, delete the url
  delete urlDbObj[shortURL];
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});

// GET /u/shortURL :redirect to the longURL for the given shortURL
app.get(APP_URLS.uShortURL, (req, res) => {
  if (!validateLoginSession(req, res)) {
    return false;
  }
  const shortURL = req.params.shortURL;
  const userId = req.session.userId || "";
  const urlObj = urlDbObj[shortURL];
  if (!urlObj) {
    const errString = `Error: URL ${shortURL} not found!`;
    sendUrlsList(userId, errString, HTTP_STATUS.BAD_REQUEST, res);
    return;
  }

  let longURL = `${urlObj.longURL}`;
  if (!longURL || !isValidHttpUrl(longURL)) {
    const errString = `Error: Not a valid url: "${longURL}", cannot redirect!`;
    sendUrlsList(userId, errString, HTTP_STATUS.BAD_REQUEST, res);
    return;
  }

  res.status(HTTP_STATUS.REDIRECT).redirect(longURL);
});

// catch-all for unknown resource links
app.get(APP_URLS.catchAll, (req, res) => {
  if (!validateLoginSession(req, res)) {
    return;
  }
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.home);
});

// start app webserver
app.listen(SERVER_PORT, () => {
  console.log(`TinyU app is listening on SERVER_PORT ${SERVER_PORT}`);
});

