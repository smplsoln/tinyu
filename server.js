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

const { generateRandomString, getUserForEmail, getUrlsForUserId } = require('./helpers');
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
  keys: [ 'secret keys', 'not needed now' ],
}));

app.use(methodOverride('_method'));

// Validate login session
const validateLoginSession = (req, res) => {
  const userId = req.session.userId;
  // if the userId cookie is not already set
  // then the user is not authenticated
  if (!userId) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Not logged in!' });
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the user is not authenticated
  if (!user) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Not logged in!' });
  }
  // validation successful
  return true;
};

// response-handler mappings

// register new user
app.get(APP_URLS.register, (req, res) => {

  // validate the current user session
  const userId = req.session.userId;
  if (!userId) {
    // userid not set in session
    // so send registration page
    return res.status(HTTP_STATUS.OK)
      .render('register', {err: ""});
  }
  // if the userId cookie is not already set
  // then the user might already exist
  // and in a currently authenticated session
  const user = users[userId];
  if (!user) {
    // no user exists for this session
    // userid so send registration page
    // after clearing the session data
    req.session = null;
    return res.status(HTTP_STATUS.OK)
      .render('register', {err: ""});
  }

  // valid session of existing registered user detected
  // so redireect to urls page
  res.status(HTTP_STATUS.REDIRECT)
    .redirect(APP_URLS.urls);
});

app.post(APP_URLS.register, (req, res) => {

  const body = req.body;
  const email = body.email;
  const password = body.password;
  const name = body.name;

  // check name, email and password was submitted
  if (!email || !password || !name) {
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .render('register', { err: 'Error: Name, email and password cannot be blank!' });
  }

  if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    // Keeping the error msg generic for safety
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .render('register', { err: 'Error: Invald name or email or password!' });
  }

  // Check if user already exists for this email
  if (getUserForEmail(email, users)) {
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('register', {err: "Error: Invalid registration details!"});
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
      res.status(HTTP_STATUS.ACCEPTED)
        .render('login', {err: ""});
    });
  });
});

// Login
app.get(APP_URLS.login, (req, res) => {

  // validate the current user session
  const userId = req.session.userId;
  if (!userId) {
    // userid not set in session
    // so send login page
    return res.status(HTTP_STATUS.OK)
      .render('login', {err: ""});
  }
  // if the userId cookie is not already set
  // then the user might already exist
  // and in a currently authenticated session
  const user = users[userId];
  if (!user) {
    // no user exists for this session
    // userid so send login page
    // after clearing the session data
    req.session = null;
    return res.status(HTTP_STATUS.OK)
      .render('login', {err: ""});
  }

  // valid session os existing registered user detected
  // so redireect to urls page
  res.status(HTTP_STATUS.REDIRECT)
    .redirect(APP_URLS.urls);
});

// process login and set user_id cookie
app.post(APP_URLS.login, (req, res) => {

  const body = req.body;
  const email = body.email;
  const password = body.password;

  // check email and password was submitted
  if (!email || !password) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Email and password cannot be blank!' });
  }

  // get the user info for this email
  let user = getUserForEmail(email, users);

  // no user with this email address
  if (!user) {
    req.session = null;
    // Purposefully keeping the error message brief and generic for safety
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Invalid email or password!' });
  }

  // compare the stored password hash with the user provided password
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      req.session = null;
      // password does not match
      return res.status(HTTP_STATUS.FORBIDDEN)
        .render('login', { err: 'Error: Email and password should be correct!' });
    }

    if (err) {
      // Such error during bcrypt is never expected
      // So logging the error, but not sending it to user for safety
      console.error({err});
      req.session = null;
      return res.status(HTTP_STATUS.FORBIDDEN)
        .render('login', { err: 'Error during authentication!' });
    }

    // User authenticated successfully
    // redirect the user
    req.session.userId = user.id;
    res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
  });
});

// process logout and set username cookie
app.post(APP_URLS.logout, (req, res) => {
  req.session = null;
  res.status(HTTP_STATUS.OK)
    .render('login', { err: "" });
});

// GET / handler
app.get(APP_URLS.home, (req, res) => {
  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }
  const userId = req.session.userId;
  const user = users[userId];

  // Find the url records for the user
  const urlsForUser = getUrlsForUserId(userId, urlDbObj);

  // Render the urls table
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    urls: urlsForUser,
    username: username,
    err: ""
  };
  res.status(HTTP_STATUS.OK)
    .render("urls_index", templateVars);
});


// GET /urls : list the urls for the current user
app.get(APP_URLS.urls, (req, res) => {

  // Validate user login session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }

  const userId = req.session.userId;
  const user = users[userId];

  // Find the url records for the user
  const urlsForUser = getUrlsForUserId(userId, urlDbObj);

  // Render the urls table
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    urls: urlsForUser,
    username: username,
    err: ""
  };
  res.status(HTTP_STATUS.OK)
    .render("urls_index", templateVars);
});


app.get(APP_URLS.urlsNew, (req, res) => {

  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }

  const userId = req.session.userId;
  const user = users[userId];

  // Create header display name string based on current usre record
  const username = `${user.name} (${user.email})`;
  const templateVars = {
    username: username,
    err: ""
  };

  res.status(HTTP_STATUS.OK)
    .render("urls_new", templateVars);
});

// POST : Add a new URL entry
app.post(APP_URLS.urls, (req, res) => {

  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }

  const userId = req.session.userId;
  const longURL = req.body.longURL;

  if (!longURL || longURL === "") {
    const user = users[userId];
    const username = `${user.name} (${user.email})`;
    const templateVars = {
      username: username,
      err: "Error: Invalid URL input!"
    };
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .render("urls_new", templateVars);
  }

  let newUrlId = generateRandomString(RANDOM_STR_LENGTH);
  urlDbObj[newUrlId] = {
    userId: userId,
    longURL: longURL
  };

  let shortURL = APP_URLS.urls + '/' + newUrlId;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

// GET /urls/:shortURL show the longURL details for the given shortURL
app.get(APP_URLS.shortUrl, (req, res) => {
  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }
  const userId = req.session.userId;
  const user = users[userId];

  const shortURL = req.params.shortURL;
  const urlObj = urlDbObj[shortURL];
  if (!urlObj) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: URL not found!' });
  }
  if (urlObj.userId !== userId) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: URL does not belong to user!' });
  }

  const username = `${user.name} (${user.email})`;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlObj.longURL,
    username: username,
    err: ""
  };
  res.status(HTTP_STATUS.OK)
    .render("urls_show", templateVars);
});

// POST /urls/:shortURL : Update the long url of a given short url
app.put(APP_URLS.shortUrl, (req, res) => {

  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }

  const userId = req.session.userId;
  const user = users[userId];
  let shortURL = req.params.shortURL;
  const urlObj = urlDbObj[shortURL];

  // If there is no entry for the shortURL or
  // the url entry belongs to another user
  // ask the user to login properly
  // posibility of impersonation
  if (!urlObj || urlObj.userId !== userId) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: Invalid user information!' });
  }

  const longURL = req.body.longURL;
  if (!longURL || longURL === "") {
    const username = `${user.name} (${user.email})`;
    const templateVars = {
      shortURL: shortURL,
      longURL: urlObj.longURL,
      username: username,
      err: "Error: Invalid long URL!"
    };
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .render("urls_show", templateVars);
  }

  urlDbObj[shortURL].longURL = longURL;
  shortURL = APP_URLS.urls + '/' + shortURL;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

// DELETE /urls/:shortURL/delete - a url entry having given shortURL
// DELETE /urls/:shortURL?_method=DELETE
app.delete(APP_URLS.deleteUrl, (req, res) => {

  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }
  const userId = req.session.userId;
  const user = users[userId];
  let surl = req.params.shortURL;
  const urlObj = urlDbObj[surl];
  if (!urlObj) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: URL not found!' });
  }

  // The current user doesnt own this url entry
  // so show error and redirect to
  if (userId !== urlObj.userId) {
    // Render the urls table
    const urlsForUser = getUrlsForUserId(userId, urlDbObj);
    const username = `${user.name} (${user.email})`;
    const templateVars = {
      urls: urlsForUser,
      username: username,
      err: "Error: URL does not belong to user for delete!"
    };
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render("urls_index", templateVars);
  }

  // All good, delete the url
  delete urlDbObj[surl];
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});

// redirect to the longURL for the given shortURL
app.get(APP_URLS.uShortURL, (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObj = urlDbObj[shortURL];
  if (!urlObj) {
    req.session = null;
    return res.status(HTTP_STATUS.FORBIDDEN)
      .render('login', { err: 'Error: URL not found!' });
  }
  let longURL = `${urlObj.longURL}`;
  if (!longURL) {
    longURL = APP_URLS.home;
  }
  res.redirect(longURL);
});

// catch-all for unknown resource links
app.get(APP_URLS.catchAll, (req, res) => {
  // validate the current user session
  if (validateLoginSession(req, res) !== true) {
    // response is alredy sent in case of error
    // else true is returned, so this is a
    // precautionary return in case of false
    return;
  }
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.home);
});

// start app webserver
app.listen(SERVER_PORT, () => {
  console.log(`TinyU app is listening on SERVER_PORT ${SERVER_PORT}`);
});

