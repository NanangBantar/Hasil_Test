const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const client = require("../../redis/redis");

const dotenv = require("dotenv");
dotenv.config();

const User = require("../../models/User");

router.post("/", [
    check('iss', 'iss is required').not().isEmpty(),
    check('password', 'password is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { iss, password } = req.body;

    try {
        let user = await User.findOne({ iss });
        if (!user) {
            res.status(400).json({ errors: [{ msg: "User doesn't exits" }] });
        }

        let isMatch = await bcryptjs.compare(password, user.password);
        if (isMatch) {
            const { iss, iat, exp, aud, sub, company_id, user_id } = user;
            const payload = {
                iss, iat, exp, aud, sub, company_id, user_id
            };
            const token = jwt.sign(payload, process.env.ACCESS_TOKEN);
            console.log(token);
            res.send("Login route");
        } else {
            res.send("Password atau Usernama anda salah");
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.post("/users/create", [
    check('iss', 'iss is required').not().isEmpty(),
    check('iat', 'iat is required and must be integer value').not().isString().isInt(),
    check('exp', 'exp is required and must be integer value').not().isString().isInt(),
    check('aud', 'aud is required').not().isEmpty(),
    check('sub', 'sub is required').not().isEmpty(),
    check('company_id', 'company_id is required').not().isEmpty(),
    check('user_id', 'user_id is required').not().isEmpty(),
    check('password', 'password is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { iss, iat, exp, aud, sub, company_id, user_id, password } = req.body;

    try {
        let user = await User.findOne({ iss });

        if (user) {
            res.status(400).json({ errors: [{ msg: "User Already exits" }] });
        }

        user = new User({
            iss,
            iat,
            exp,
            aud,
            sub,
            company_id,
            user_id,
            password
        });

        const salt = await bcryptjs.genSalt(10);

        user.password = await bcryptjs.hash(password, salt);

        await user.save();

        res.send("Register User");
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/logout", (req, res) => {
    client.del("updated");
    client.del("document");
    client.del("all");
    res.clearCookie("folder");
    res.send("Anda telah logout");
});

module.exports = router;