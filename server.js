// module imports
const express = require('express');
// const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');

// CONSTANTS
const RANDOM_STR_LENGTH = 6;
const SERVER_PORT = 3000;
const HTTP_STATUS = {
  GET_OK: 200,
  REDIRECT: 302
};
const APP_URLS = {
  home: '/',
  urls: '/urls',
  shortUrl: '/urls/:shortURL',
  urlsNew: "/urls/new",
  deleteUrl: "/urls/:shortURL/delete",
  uShortURL: "/u/:shortURL",
  favicon: '/favicon.ico',

  catchAll: '*'
};

const RESOURCES = {
  favicon: './resources/favicon/favicon.ico'

};

const urlDbObj = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generate random string
const generateRandomString = (strLen) => {
  let charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charSetLen = charSet.length;
  let rndmStr = '';
  for (let i = 0; i < strLen; i++) {
    rndmStr += charSet.charAt(Math.floor(Math.random() *
      charSetLen));
  }
  return rndmStr;
};

// Init Express app
const app = express();

// Set ejs as view engine
app.set('view engine', 'ejs');

// middleware inits
app.use(favicon(RESOURCES.favicon));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// resource-handler mappings
app.get(APP_URLS.home, (req, res) => {
  res.status(HTTP_STATUS.GET_OK).send(`Thanks for visiting TinyU "${req.url}"`);
});

app.get(APP_URLS.urls, (req, res) => {
  // res.status(HTTP_STATUS.GET_OK).send(`TinyU URLs: "${JSON.stringify(urlDbObj)}"`);
  // res.status(HTTP_STATUS.GET_OK).json(urlDbObj);
  const templateVars = { urls: urlDbObj };
  res.render("urls_index", templateVars);
});

app.get(APP_URLS.urlsNew, (req, res) => {
  res.render("urls_new");
});

// POST : Add a new URL entry
app.post(APP_URLS.urls, (req, res) => {
  let rndmStrId = generateRandomString(RANDOM_STR_LENGTH);
  urlDbObj[rndmStrId] = req.body.longURL;
  let shortURL = APP_URLS.urls + '/' + rndmStrId;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

//POST /urls/:shortURL : Update the long url of a given short url
app.post(APP_URLS.shortUrl, (req, res) => {
  let surl = req.params.shortURL;
  urlDbObj[surl] = req.body.longURL;
  let shortURL = APP_URLS.urls + '/' + surl;
  res.redirect(HTTP_STATUS.REDIRECT, shortURL);
});

//DELETE a url entry having given shortURL
app.post(APP_URLS.deleteUrl, (req, res) => {
  let surl = req.params.shortURL;
  delete urlDbObj[surl];
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.urls);
});


// /urls/:id show the longURL details for the given shortURL
app.get(APP_URLS.shortUrl, (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: `${urlDbObj[req.params.shortURL]}`
  };
  res.render("urls_show", templateVars);
});

// redirect to the longURL for the given shortURL
app.get(APP_URLS.uShortURL, (req, res) => {
  let longURL = urlDbObj[req.params.shortURL];
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