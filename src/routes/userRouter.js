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
// const { sendEmail } = require("../middlewares/emailService");
const nodemailer = require('nodemailer');
const { sendEmail } = require("../middlewares/emailService");
const jwt = require("jsonwebtoken");


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
    _.pick(req.body, ["name", "email", "password", "phone"])
  );

  // Generate a verification token
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "1d",
  });

  await sendEmail(newUser.email, newUser.name, token);

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  newUser = await newUser.save();

  res.status(201).json({message: "User created successfully!"});
});

router.get("/user/confirm-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Missing confirmation token." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email confirmed successfully. You can now log in." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Confirmation link expired. Please request a new one." });
    }
    res.status(400).json({ error: "Invalid confirmation token." });
  }
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
