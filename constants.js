/**
 * TinyU Constants
 */

const RANDOM_STR_LENGTH = 6;
const SERVER_PORT = 3000;

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  REDIRECT: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
};
const APP_URLS = {
  home: '/',
  login: '/login',
  register: '/register',
  logout: '/logout',
  urls: '/urls',
  shortUrl: '/urls/:shortURL',
  urlsNew: "/urls/new",
  deleteUrl: "/urls/:shortURL", // "/urls/:shortURL/delete",
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
  }
};

const urlDbObj = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  }
};

module.exports = {
  RANDOM_STR_LENGTH, SERVER_PORT, HTTP_STATUS,
  APP_URLS, RESOURCES, users, urlDbObj
};