const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/fakeUsers");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  const user = users.find(
    (u) =>
      u.email === email &&
      u.password === password &&
      u.role === role.toLowerCase(),
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, "secret_key", {
    expiresIn: "1d",
  });

  res.json({ token, role: user.role });
});
module.exports = router;
