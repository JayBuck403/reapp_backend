const mongoose = require("mongoose");
const express = require("express");
const { userSchema, User } = require("../models/users");
const { propertySchema, Property } = require("../models/properties");
const auth = require("../middlewares/authMiddleware");
const paginate = require("../middlewares/paginate");
const Joi = require("joi");
const { validatePropertySchema } = require("./validation");
const _ = require("lodash");

const router = express.Router();

// Get all properties with pagination
router.get("/", paginate, async (req, res) => {
  try {
  const properties = await Property.find()
    .skip(req.pagination.startIndex)
    .limit(req.pagination.limit);
  res.send(properties);
  } catch (error) {
    res.status(404).send("Not found");
  }
});

// Add a property
router.post("/", auth, async (req, res) => {
  try {
    await validatePropertySchema.validateAsync(req.body);

    let property = new Property({
      ...req.body,
      companyRef: req.user._id, // Assuming auth middleware adds `user` to request
    });

    property = await property.save();
    res.status(201).send(property);
  } catch (error) {
    res
      .status(400)
      .send(error.details ? error.details[0].message : error.message);
  }
});

// Get single property
router.get("/:_id", async (req, res) => {
  try {
    const property = await Property.findById(req.params._id).populate(
      "companyRef"
    );
    if (!property)
      return res.status(404).send("The specified property was not found");

    res.send(
      _.pick(property, [
        "title",
        "type",
        "category",
        "description",
        "price",
        "currency",
        "companyRef",
        "negotiable",
        "bedrooms",
        "bathrooms",
        "amenities",
        "area",
        "unit",
        "propertyLocation",
        "region",
        "imageUrls",
        "landmarks",
      ])
    );
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Search properties
router.get("/search/q", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    if (!req.query.q || req.query.q.length < 3) {
      return res.status(400).json({ msg: "Search query too short" });
    }

    const qRegex = new RegExp(req.query.q, "i");
    const properties = await Property.find({
      $or: [
        { type: qRegex },
        { title: qRegex },
        { description: qRegex },
        { propertyLocation: qRegex },
        { category: qRegex },
        { landmarks: qRegex },
      ],
    })
      .populate("companyRef")
      .skip(startIndex)
      .limit(limit);

    if (!properties.length)
      return res.status(404).json({ msg: "No Property Found" });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// User's property listings
router.get("/my_listings", auth, async (req, res) => {
  try {
    const properties = await Property.find({ companyRef: req.user._id });
    res.status(200).send(properties);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Get similar properties
router.get("/listings/similar_listings", async (req, res) => {
  try {
    const similarProperties = await Property.aggregate([
      { $sample: { size: 12 } },
    ]);
    res.status(200).send(similarProperties);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Edit a property
router.put("/my_listings/:_id", auth, async (req, res) => {
  try {
    await validatePropertySchema.validateAsync(req.body);

    const property = await Property.findOneAndUpdate(
      { _id: req.params._id, companyRef: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!property)
      return res.status(404).send("The specified property was not found");

    res.json(property);
  } catch (error) {
    res
      .status(400)
      .send(error.details ? error.details[0].message : error.message);
  }
});

// Delete a property
router.delete("/:_id", auth, async (req, res) => {
  try {
    const property = await Property.findOneAndRemove({
      _id: req.params._id,
      companyRef: req.user._id,
    });
    if (!property)
      return res.status(404).send("The specified property was not found");

    res.json({ message: "Property successfully deleted" });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
