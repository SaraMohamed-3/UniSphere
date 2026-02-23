const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../data/db");

const router = express.Router();

const crypto = require("crypto");

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  console.log("FORGOT PASSWORD ROUTE HIT"); // debug line

  try {
    const { email } = req.body;

    const result = await db.query(
      `SELECT user_id, email FROM users WHERE email = $1`,
      [email],
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expire = Date.now() + 3600000;

    await db.query(
      `UPDATE users SET reset_token = $1, reset_token_expire = $2 WHERE user_id = $3`,
      [token, expire, user.user_id],
    );

    res.json({
      message: "Reset link generated (email optional for now)",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ================= RESET PASSWORD =================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const result = await db.query(
      `SELECT user_id FROM users
       WHERE reset_token = $1 AND reset_token_expire > $2`,
      [token, Date.now()],
    );

    const user = result.rows[0];
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token = NULL,
           reset_token_expire = NULL
       WHERE user_id = $2`,
      [hash, user.user_id],
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const result = await db.query(
      `SELECT user_id, email, password_hash, role, is_active
       FROM users
       WHERE email = $1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.is_active)
      return res.status(403).json({ message: "Account is inactive" });

    // role check (your frontend sends role)
    if (role && user.role !== role.toLowerCase()) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("LOGIN ATTEMPT:");
    console.log("Password entered:", password);
    console.log("Hash in DB:", user.password_hash);

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    console.log("Bcrypt result:", ok);

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token, role: user.role, user_id: user.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
