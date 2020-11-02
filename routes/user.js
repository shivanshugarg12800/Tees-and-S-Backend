// in this we have created the routes related to the User
const express = require("express");
const router = express.Router();

// requiring the controllers for the User.....
const {
  getUserById,
  getUser,
  updateUser,
  userPurchaseList,
} = require("../controllers/user");

// requiring the controllers from the auth.... to check for the user...
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

// using the router.param() which acts as the callback for the parameter....
router.param("userId", getUserById);

// getting the user from the userID through GET request....
router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);

// updating the user of the given userID through the PUT request....
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser);

router.put(
  "/orders/user/:userId",
  isSignedIn,
  isAuthenticated,
  userPurchaseList
);

module.exports = router;
