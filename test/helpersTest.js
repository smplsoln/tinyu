const { assert } = require('chai');

const { getUserForEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const email = "user@example.com";
    const user = getUserForEmail(email, testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here

    assert.equal(user.id, expectedOutput, `UserId ${user.id} is not thecorrect id for email ${email}`);
  });

  it('should return undefined for non-existent email', function() {
    const email = "a@a.com";
    const user = getUserForEmail(email, testUsers);
    // Write your assert statement here

    assert.isUndefined(user, `User ${user} should have been undefined for email ${email}`);
  });
});