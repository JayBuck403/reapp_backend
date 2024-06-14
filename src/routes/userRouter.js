const mongoose = require("mongoose");
const express = require("express");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { userSchema, User } = require("../models/users");
const { validateUserSchema } = require("./validation");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();
const cron = require("node-cron");

router.get("/", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

router.get("/:_id", async (req, res) => {
  const user = await User.findById(req.params._id);
  !user
    ? res.status(404).send("User not found")
    : res.send(
        _pick(user, [
          "id",
          "name",
          "email",
          "created_at",
          "updated_at",
          "isActivated",
          "listingActivationDays",
          "phone",
          "avatar",
        ])
      );
});

router.post("/", async (req, res) => {
  try {
    const { error } = await validateUserSchema.validateAsync(req.body);
  } catch (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let userAlreadyRegistered = await User.findOne({ email: req.body.email });
  if (userAlreadyRegistered)
    return res.status(400).send("User already registered.");

  let newUser = new User(
    _.pick(req.body, ["name", "email", "password", "confirmPassword", "phone"])
  );

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);
  newUser.confirmPassword = await bcrypt.hash(newUser.confirmPassword, salt);

  newUser = await newUser.save();

  res.send(_.pick(newUser, ["_id", "name", "email", "phone"]));
});

router.put("/:_id", auth, async (req, res) => {
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const user = await User.findByIdAndUpdate(
    req.params._id,
    {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      avatar: req.body.avatar,
    },
    { new: true }
  );

  !user
    ? res.status(404).send("User not found")
    : res.send(_.pick(user, ["_id", "name", "email", "phone"]));
});

router.delete("/:_id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params._id);
  !user ? res.status(404).send("User not found") : res.send(user);
});

// payment activation

router.patch("/listing_activation", async (req, res) => {
  const user = await User.findOneAndUpdate(
    { email: req.body.email },
    { isActivated: true, listingActivationDays: 30 }
  );
  console.log(user, "GHC", req.body.amount / 100);
  res.send(user);
});

// Schedule a task to run at midnight every day
// This manages user listings for a period of 30 days

cron.schedule("0 0 * * *", async () => {
  try {
    await User.updateMany(
      { listingActivationDays: { $gt: 0 } },
      { $inc: { listingActivationDays: -1 } }
    );
    console.log("Decremented activeDays for all users", new Date());
  } catch (error) {
    console.error("Error decrementing activeDays", error);
  }
});

module.exports = router;
