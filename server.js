// module imports
const express = require('express');
// const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// CONSTANTS
const RANDOM_STR_LENGTH = 6;
const SERVER_PORT = 3000;
const USER_ID = 'user_id';
const COOKIES = {
  USER_ID: USER_ID
};
const HTTP_STATUS = {
  GET_OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  REDIRECT: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
};
const APP_URLS = {
  home: '/',
  login: '/login',
  register: '/register',
  logout: '/logout',
  urls: '/urls',
  shortUrl: '/urls/:shortURL',
  urlsNew: "/urls/new",
  deleteUrl: "/urls/:shortURL/delete",
  uShortURL: "/u/:shortURL",
  favicon: '/favicon.ico',

  catchAll: '*'
};

const RESOURCES = {
  favicon: './public/images/favicon.ico'
};

const users = {
  "userId1": {
    id: "userId1",
    name: "Iron Man",
    email: "user1@example.com",
    password: "123"
  },
  "userId2": {
    id: "userId2",
    name: "Black Widow",
    email: "user2@example.com",
    password: "234"
  }
};

/* const urlDbObj = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; */

const urlDbObj = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

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

const getUserForEmail = (emailAddr) => {
  for (const uid of Object.keys(users)) {
    if (users[uid].email === emailAddr) {
      return users[uid];
    }
  }
  return false;
};

// Init Express app
const app = express();
app.use(favicon(RESOURCES.favicon));
app.use(express.static('public'));
app.use(morgan('dev'));

// Set ejs as view engine
app.set('view engine', 'ejs');

// middleware inits
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// response-handler mappings

// register new user
app.get(APP_URLS.register, (req, res) => {
  res.render('register');
});

app.post(APP_URLS.register, (req, res) => {

  const body = req.body;
  const email = body.email;
  const password = body.password;
  const name = body.name;

  // check name, email and password was submitted
  if (!email || !password || !name) {
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .send('Name, email and password cannot be blank!');
  }

  // Check if user already exists for this email
  if (getUserForEmail(email)) {
    return res.redirect(HTTP_STATUS.FORBIDDEN, APP_URLS.register);
  }

  // add new user
  const newUserId = generateRandomString(3);
  users[newUserId] = {
    id: newUserId,
    name: name,
    email: email,
    password: password
  };

  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.login);
});

// Login
app.get(APP_URLS.login, (req, res) => {
  res.render('login');
});

// process login and set user_id cookie
app.post(APP_URLS.login, (req, res) => {

  const body = req.body;
  const email = body.email;
  const password = body.password;

  // check email and password was submitted
  if (!email || !password) {
    return res.status(HTTP_STATUS.FORBIDDEN)
      .send('email and password cannot be blank');
  }

  // get the user info for this email
  let user = getUserForEmail(email);

  // no  user with this email address
  if (!user) {
    return res.redirect(HTTP_STATUS.FORBIDDEN, APP_URLS.login);
  }

  // password does not match
  if (user.password !== password) {
    return res.redirect(HTTP_STATUS.FORBIDDEN, APP_URLS.login);
  }

  // User authenticated successfully
  res.cookie(COOKIES.USER_ID, user.id)
    .redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});

// process logout and set username cookie
app.post(APP_URLS.logout, (req, res) => {
  res.status(HTTP_STATUS.CREATED)
    .clearCookie(COOKIES.USER_ID)
    .redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});

// GET /home handler
app.get(APP_URLS.home, (req, res) => {
  res.status(HTTP_STATUS.GET_OK)
    .send(`Thanks for visiting TinyU "${req.url}"`);
});

// GET /urls
app.get(APP_URLS.urls, (req, res) => {
  // res.status(HTTP_STATUS.GET_OK).send(`TinyU URLs: "${JSON.stringify(urlDbObj)}"`);
  // res.status(HTTP_STATUS.GET_OK).json(urlDbObj);

  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const templateVars = {
    urls: urlDbObj,
    username: user.name
  };
  res.render("urls_index", templateVars);
});

app.get(APP_URLS.urlsNew, (req, res) => {
  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const templateVars = {
    // urls: urlDbObj,
    username: user.name
  };

  res.render("urls_new", templateVars);
});

// POST : Add a new URL entry
app.post(APP_URLS.urls, (req, res) => {

  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const longURL = req.body.longURL;
  console.log({longURL});
  if (!longURL || longURL === "") {
    return res.redirect(HTTP_STATUS.BAD_REQUEST, APP_URLS.urls);
  }

  let rndmStrId = generateRandomString(RANDOM_STR_LENGTH);
  urlDbObj[rndmStrId] = {
    userId: userId,
    longURL: longURL
  };

  let shortURL = APP_URLS.urls + '/' + rndmStrId;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

//POST /urls/:shortURL : Update the long url of a given short url
app.post(APP_URLS.shortUrl, (req, res) => {
  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  let shortURL = req.params.shortURL;
  const urlObj = urlDbObj[shortURL];
  if (!urlObj || urlObj.userId !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const longURL = req.body.longURL;
  console.log({longURL});
  if (!longURL || longURL === "") {
    return res.redirect(HTTP_STATUS.BAD_REQUEST, APP_URLS.urls);
  }

  urlDbObj[shortURL].longURL = longURL;
  shortURL = APP_URLS.urls + '/' + shortURL;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

//DELETE a url entry having given shortURL
app.post(APP_URLS.deleteUrl, (req, res) => {
  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }
  let surl = req.params.shortURL;


  delete urlDbObj[surl];
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});


// /urls/:id show the longURL details for the given shortURL
app.get(APP_URLS.shortUrl, (req, res) => {
  const userId = req.cookies[COOKIES.USER_ID];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const user = users[userId];
  // if the userId cookie is not already set
  // then the usser is not authenticated
  if (!user) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const shortURL = req.params.shortURL;
  const urlObj = urlDbObj[shortURL];
  if (urlObj.userId !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).redirect(APP_URLS.login);
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlObj.longURL,
    username: user.name
  };
  res.render("urls_show", templateVars);
});

// redirect to the longURL for the given shortURL
app.get(APP_URLS.uShortURL, (req, res) => {
  let longURL = `${urlDbObj[req.params.shortURL].longURL}`;
  if (!longURL) {
    longURL = APP_URLS.home;
  }
  res.redirect(longURL);
});

// catch-all for unknown resource links
app.get(APP_URLS.catchAll, (req, res) => {
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.home);
  // res.redirect(APP_URLS.home);
});

// start app webserver
app.listen(SERVER_PORT, () => {
  console.log(`TinyU app is listening on SERVER_PORT ${SERVER_PORT}`);
});