// in this we'll be doing the usual stuff as we did in the user.js ( routes )

const express = require("express");
const router = express.Router();

const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  removeCategory,
} = require("../controllers/category");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

router.param("userId", getUserById); // providing a callback to the parameter userId
router.param("categoryId", getCategoryById); // similar to the userId

// actual routes here
// here we are creating a category and which can be created by admin only...
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
);

// route to get the category..
router.get("/category/:categoryId", getCategory);
// to get all the categories..
router.get("/categories", getAllCategory);

// update the category
router.put(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

// delete the category
router.delete(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);

module.exports = router;
