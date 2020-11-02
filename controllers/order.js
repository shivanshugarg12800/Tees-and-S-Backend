const express = require("express");
const { Order, ProductCart } = require("../models/order");

exports.getOrderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price") // picking up a single product and then bringing their name and price
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Order was not found",
        });
      }
      req.order = order;
      next();
    });
};

exports.createOrder = (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body);

  order.save((err, order) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to save the order in the DB",
      });
    }
    res.json(order);
  });
};

exports.getAllOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No order was found in the DB",
        });
      }
      res.json(order);
    });
};

// to read the order status (by admin only..)
exports.getOrderStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.update(
    { _id: req.body._id },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: "Cannot update the order status",
        });
      }
      res.json(order);
    }
  );
};
