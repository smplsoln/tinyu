// module imports
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
// CONSTANTS
const SERVER_PORT = 3000;
const HTTP_STATUS = {
  GET_OK: 200,
  REDIRECT: 302
};
const APP_URLS = {
  home: '/',
  urls: '/urls',
  favicon: '/favicon.ico',

  catch_all: '*'
};

const RESOURCES = {
  favicon: './resources/favicon/favicon.ico'

};

const urlDbObj = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Init Express app
const app = express();

// middleware inits
app.use(favicon(RESOURCES.favicon));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// resource-handler mappings
app.get(APP_URLS.home, (req, res) => {
  res.status(HTTP_STATUS.GET_OK).send(`Thanks for visiting TinyU "${req.url}"`);
});

app.get(APP_URLS.urls, (req, res) => {
  // res.status(HTTP_STATUS.GET_OK).send(`TinyU URLs: "${JSON.stringify(urlDbObj)}"`);
  res.status(HTTP_STATUS.GET_OK).json(urlDbObj);
});



// catch-all for unknown resource links
app.get(APP_URLS.catch_all, (req, res) => {
  res.redirect(HTTP_STATUS.REDIRECT, APP_URLS.home);
  // res.redirect(APP_URLS.home);
});

// start app webserver
app.listen(SERVER_PORT, () => {
  console.log(`TinyU app is listening on SERVER_PORT ${SERVER_PORT}`);
});