const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true; // for the extensions .jpg or .ong

  form.parse(req, (err, fields, file) => {
    // fields contaian the text file and files contain the uploaded files
    if (err) {
      return res.status(400).json({
        error: "Problem with the image",
      });
    }

    // simple check for the form data...
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "All the fields are compulsory",
      });
    }
    let product = new Product(fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to the db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "saving T shirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};
exports.getProduct = (req, res) => {
  req.product.photo.data = undefined; // the data is too much big to get in the json response.. so do undefined
  return res.json(req.product);
};
//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;

  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    res.json({
      message: "Deleted Successfully..",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  // for update too, we'll get the same form to input the updated data
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    // fields contaian the text file and files contain the uploaded files
    if (err) {
      return res.status(400).json({
        error: "Problem with the image",
      });
    }
    // updation code
    let product = req.product;
    product = _.extend(product, fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to the db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Updation of product failed",
        });
      }
      res.json(product);
    });
  });
};

// product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : undefined; // given by the user
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"; // sorting the products by id as default....
  Product.find()
    .select("-photo") // to display specific information ( - means not to show)
    .populate("category")
    .sort([[sortBy, "asc"]]) // this is sorting of the products either by user or by _id
    .limit(limit) // setting limit to how many to show on the page
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product found",
        });
      }
      res.json(products);
    });
};
// this is for getting all the unique categories to make product ..
exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "Category not found",
      });
    }
    res.json(category);
  });
};

// this is the middleware designed to update the stock and the sold in the product model....
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        // from the mongoose bulkWrite()
        filter: { _id: prod._id }, // getting the product of the id
        update: { $inc: { stock: -prod.count, sold: +prod.count } }, // incrementing the stock and sold with prod.count ( count will be passed from the frontend)
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (error, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operations failed..",
      });
    }
    next();
  });
};
