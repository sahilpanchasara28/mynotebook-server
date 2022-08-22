const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getuser = require("../middleware/getuser");

const JWT_SECRET = "Sahilssecretkey";

//Route 1: Create user using: POST "/api/auth/createUser" doesn't require authentication

router.post(
  "/createUser",
  body("name", "name must be 3 characters long !!").isLength({ min: 3 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "password must be 5 characters long !!").isLength({
    min: 5,
  }),
  async (req, res) => {
    let success = true;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    /*
    console.log(req.body);
    const user = User(req.body);
    user.save();
    res.send(req.body);
    */

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Sorry a user with this email already exists !!",
          });
      }

      const salt = await bcrypt.genSalt(10);
      securePass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ success, authToken });
    } catch (error) {
      success = false;
      console.log(error.message);
      res.status(500).json({ success, error: "Something went wrong !!" });
    }
  }
);

//Route 2: Authenticate user using: POST "/api/auth/login"

router.post(
  "/login",
  body("email", "Enter a valid email.").isEmail(),
  body("password", "password cannot be empty.").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    let success = true;
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Please try again with correct credentials.",
          });
      }

      const passCompare = await bcrypt.compare(password, user.password);

      if (!passCompare) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Please try again with correct credentials.",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ success, authToken });
    } catch (error) {
      success = false;
      console.log(error.message);
      res.status(500).json({ success, error: "Something went wrong !!" });
    }
  }
);

//Route 3: get loggedin user details using: POST "/api/auth/getuser"  login required

router.post("/getUser", getuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(400)
        .json({ error: "Please try again with correct credentials." });
    }

    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong !!");
  }
});

module.exports = router;
