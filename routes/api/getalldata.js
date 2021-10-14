// core lib
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const client = require("../../redis/redis");

dotenv.config();

const Document = require("../../models/Document");
const Folder = require("../../models/Folder");

router.get("/", (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                try {
                    client.get("all", async (err, all) => {
                        if (err) throw err;
                        if (all | all !== null) {
                            res.status(201).json({
                                error: false,
                                message: "Success get document",
                                data: JSON.parse(all)
                            });
                        } else {
                            let document = await Document.find().select("-_id -__v");
                            let folder = await Folder.find().select("-_id -__v");
                            document = document.map(val => val);
                            folder = folder.map(val => val);
                            let fixedAll = document.concat(folder);
                            client.set("all", JSON.stringify(fixedAll));

                            res.status(201).json({
                                error: false,
                                data: fixedAll
                            });
                        }
                    });
                } catch (err) {
                    console.log(err.message);
                    res.status(500).send("Server Error");
                }
            } else {
                res.status(401).json({
                    error: true,
                    message: "Unauthorized"
                });
            }
        });
    } else {
        res.status(401).json({
            error: true,
            message: "Unauthorized"
        });
    }
});

module.exports = router;