# TinyApp Project

TinyU is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Registration Page"](https://github.com/smplsoln/tinyu/blob/master/docs/RegistrationPage.png)

!["Login with User Inputs"](https://github.com/smplsoln/tinyu/blob/master/docs/Login_withUserInputs.png)

!["MyURLs Page For New User Login"](https://github.com/smplsoln/tinyu/blob/master/docs/MyURLS_Page_For_NewUserLogin.png)

!["Create/Add New URL"](https://github.com/smplsoln/tinyu/blob/master/docs/Create_Add_New_URL_.png)

!["GET URLs Table for My URLS page"](https://github.com/smplsoln/tinyu/blob/master/docs/GET_URLs_Table.png)

!["URL DetailsPage after adding"](https://github.com/smplsoln/tinyu/blob/master/docs/URL_DetailsPage_after_adding.png)

!["Update/Edit New LongURL into Existing entry "](https://github.com/smplsoln/tinyu/blob/master/docs/Update_Edit_New_LongURL_intoExisting_entry_.png)

!["After Update URL"](https://github.com/smplsoln/tinyu/blob/master/docs/After_Update_URL.png)

!["URLs Table after update"](https://github.com/smplsoln/tinyu/blob/master/docs/Urls_Table_after_update.png)

!["Add another URL"](https://github.com/smplsoln/tinyu/blob/master/docs/Add_another_URL.png)

!["URLs table after adding new URL"](https://github.com/smplsoln/tinyu/blob/master/docs/URLs_table_after_adding_new_URL.png)

!["Login Page Error Invalid email pass"](https://github.com/smplsoln/tinyu/blob/master/docs/LoginPage_Error_Invalid_email_pass.png)

!["Login error msg Invalid email password non existing user email"](https://github.com/smplsoln/tinyu/blob/master/docs/Login_error_msg_Invalid_email_password_non_existing_user_email.png)

!["Login error msg invalid email"](https://github.com/smplsoln/tinyu/blob/master/docs/Login_error_msg_invalid_email.png)

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
 - Completed the stretch requirement of method-override for
    - `DELETE /urls/:shortURLId` : to delete the url entry specified by id
    - `PUT /urls/:shortURLId` : to update the longURL for a given shortURLId
 - A lot of error handling for each endpoint and method, hopefully covered almost all cases. Main considerations in error handling:
    - Give some clear error message and
    - At the same time try to not reveal too much and compromise security
    - Provide indication of next action to take got the user
    - Move to the newxt suitable page while displaying the error message in HTML
    - To keep it DRY as much as possible
    - Maintain secure state of the session information
 - User name attribute in inputs and users store and header display
 - Favicon support with its unique icon for tabs and static logo image in header,
 - Tried to separated out all main constants and helper funstion into separate JS /constants.js and helpers.js


# Possible Future Enhancements
  - Refactor the server side logic to make is restful and provide a restful API
  - Separate out the view and base it on the use of REST apis underneath
  - Improve observability by adding aproprate logging on server side
  - Add integrated metrics tracking
  - Move the UI esp the views to a better framework having better easier control on components and refactor/componentize it further
  - Add distinct persistence layer: NoSQL/DB/Or a backend PaaS
  - Add automated CI/CD workflow with layereed codee-review, tests outcome reporting, static analysis reporting, reporting checkpoints, code coveerage reporting