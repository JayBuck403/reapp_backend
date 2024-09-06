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

// Get all properties
router.get("/", async (req, res) => {
  const allProperties = await Property.find();
  res.send(allProperties);
});

// Add a property
router.post("/", auth, async (req, res) => {
  try {
    const { error } = await validatePropertySchema.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let property = new Property({
    title: req.body.title,
    type: req.body.type,
    category: req.body.category,
    description: req.body.description,
    price: req.body.price,
    currency: req.body.currency,
    negotiable: req.body.negotiable,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    amenities: req.body.amenities,
    area: req.body.area,
    unit: req.body.unit,
    propertyLocation: req.body.propertyLocation,
    region: req.body.region,
    imageUrls: req.body.imageUrls,
    companyRef: req.body.companyRef,
    landmarks: req.body.landmarks,
  });

  property = await property.save();

  res.send(property);
});

// Get single property
router.get("/:_id", async (req, res) => {
  const property = await Property.findById(req.params._id).populate(
    "companyRef"
  );
  !property
    ? res.status(404).send("The specified property was not found")
    : res.send(
        _.pick(property, [
	  "_id",
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
});

// Search router
router.get("/search/q", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    if (req.query.q === "null" || req.query.q.length < 3) return res.status(404).json({"msg": "No Property Found"})
    const q = req.query.q;
    console.log(q, q.length)
    const qRegex = new RegExp(q, "i");

    const properties = await Property.find({
      $or: [
	{type: qRegex},
	{title: qRegex},
	{description: qRegex},
	{propertyLocation: qRegex},
	{category: qRegex},
	{landmarks: qRegex},
      ]
    }).populate("companyRef")
    .then((properties) => {
      res.status(200).json(properties);
    })
    .catch((error) => {
      res.status(404).json({"msg": "No Property Found"})
    });
    
  } catch (error) {
    res.status(404).json({"msg":"No matching records"})
  }
});

router.get("/my_listings/:_id", auth, async (req, res) => {
  const user = await User.findById(req.params._id);

  if (user._id.toString() === req.params._id) {
    try {
      const properties = await Property.find({ companyRef: req.params._id });
      res.status(200).send(properties);
    } catch (error) {
      res.status(404).send("The specified property was not found");
    }
  } else {
    res.status(401).send("You can only view your own listings");
  }
});

// Get similar properties

router.get("/listings/similar_listings", async (req, res) => {
  try {
    const similarProperties = await Property.aggregate([{$sample: {size: 8}}]);
    res.status(200).send(similarProperties);
  } catch (error) {
    res.status(404).send("Nothing found");
  }

});

//router.get("/sortBy/query", async (req, res) => {
//  let type = req.query.type;
//    if (type === undefined) {
//      type = { $in: ["apartment", "house", "land", "office"] };
//    }   
    
//    let priceRange = req.query.priceRange;

//  const property = await Property.find({ type: req.query.type });
//  !property
//    ? res.status(404).send("The specified property was not found")
//    : res.send(property);
  //res.send(req.query);
//});

// Edit a property
router.put("/my_listings/:_id", auth, async (req, res) => {
  try {
    const { error } = await validatePropertySchema.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const property = await Property.findByIdAndUpdate(
    req.params._id,
    {
      title: req.body.title,
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      currency: req.body.currency,
      negotiable: req.body.negotiable,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      amenities: req.body.amenities,
      area: req.body.area,
      unit: req.body.unit,
      propertyLocation: req.body.propertyLocation,
      landmarks: req.body.landmarks,
      region: req.body.region,
      isVerified: req.body.isVerified,
      imageUrls: req.body.imageUrls,
      isAvailable: req.body.isAvailable,
      viewsCount: req.body.viewsCount,
    },
    { new: true }
  );
  !property
    ? res.status(404).send("The specified property was not found")
    : res.json(property);
});

//router.patch('/:id', (req, res) => {
//  res.send('edit a property field');
//});

// Delete a property
router.delete("/:_id", auth, async (req, res) => {
  const property = await Property.findByIdAndRemove(req.params._id);
  !property
    ? res.status(404).send("The specified property was not found")
    : res.json({ message: "success" });
});

module.exports = router;
