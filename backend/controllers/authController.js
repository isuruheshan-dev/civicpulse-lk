const bcrypt = require("bcryptjs");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { full_name, email, password } = req.body;

    // Check required fields
    if (!full_name || !email || !password) {
        return res.status(400).json({
            message: "Full name, email and password are required"
        });
    }

    try {
        // Check whether email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create citizen account
        const newUser = await pool.query(
            `INSERT INTO users
            (full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, email, role, created_at`,
            [
                full_name.trim(),
                email.toLowerCase().trim(),
                passwordHash,
                "citizen"
            ]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        // Find user by email
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare entered password with stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    register,
    login
};