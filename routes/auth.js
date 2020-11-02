// this basically contains the routes of the authorization...
var express = require("express");
var router = express.Router();

// this is used to add some validations or some kind of checks in the input..
const { check, validationResult } = require("express-validator");

const { signout, signup, signin, isSignedIn } = require("../controllers/auth");
//  signUp route.......................................
router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 3 char").isLength({
      min: 3,
    }),
  ],
  signup
);
// signIn route......................................
router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 1 }),
  ],
  signin
);
// signOut route.........................
router.get("/signout", signout);

module.exports = router;
