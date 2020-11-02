// // this is the controllers section where we basically control what happens in our callback function
// // now we need to connect this with our route which itself is connected with the main app.js file..

// // this way if wanna make any changes to the controller we can make it here

const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

// signUp route....................................
exports.signup = (req, res) => {
  const errors = validationResult(req);
  // this is the validation result display...
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg, // as in the docuementation..validation result is an array...converting to array...then accessing the first element and the property to access
    });
  }
  // creating the User object of User schema.
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB",
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
    });
  });
};

// signIn route .....................................
exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body; // basically destructuring the req.body to get the email and password..

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  // to authenticate the user we first get the user from the DB with the given email
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }
    // after chacking the email we'll check for the password through authenticate function in the user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    //create token  based on the user Id and the second parameter is any string which is created in the .env
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

// signOut route.................................................
exports.signout = (req, res) => {
  res.clearCookie("token"); // signing out basically means clearing out the cookies and tokens
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  // this is the use of expressJWt..which itself validates the authorization token
  secret: process.env.SECRET,
  userProperty: "auth", // this contains the user property _id of the user which has signed in...that is used down here
});

//custom middlewares................................
// this is basically, user is signed in but it should be authenticated to make changes or move around
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "You are not authenticated",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
