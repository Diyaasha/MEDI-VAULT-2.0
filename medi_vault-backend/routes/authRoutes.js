const express = require("express");
const router = express.Router();
const signup = require("../controllers/auth/signupController");
const login = require("../controllers/auth/loginController");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;