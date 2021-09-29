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
  let rndmStr = '';
  let charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charSetLen = charSet.length;
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
  const templatelets = { urls: urlDbObj };
  res.render("urls_index", templatelets);
});

app.get(APP_URLS.urlsNew, (req, res) => {
  res.render("urls_new");
});

app.post(APP_URLS.urls, (req, res) => {
  let rndmStrId = generateRandomString(RANDOM_STR_LENGTH);
  urlDbObj[rndmStrId] = req.body.longURL;
  res.send("ok");
});

// /url/:id here
app.get(APP_URLS.shortUrl, (req, res) => {
  const templatelets = {
    shortURL: req.params.shortURL,
    longURL: `${urlDbObj[req.params.shortURL]}`
  };
  res.render("urls_show", templatelets);
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