# TinyApp Project

TinyU is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)

!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- morgan
- cookie-session
- serve-favicon
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using one of the  following commands:
  - `npm node_start` := `node server.js`
  - `npm start` := `./node_modules/.bin/nodemon -L server.js`

# TinyU app includes the following
Apart from implementing all the major, minor requirements have aditionally added
 - Favicon support with its unique icon for tabs
 - Static logo image in header,
 - User name attribute in inputs and users store and header display
 - Separated out all main constants into /constants.js
 - Completed the stretch requirement of meethod-override for
    - `DELETE /urls/:shortURLId` : to delete the url entry specified by id
    - `PUT /urls/:shortURLId` : to update the longURL for a given shortURLId