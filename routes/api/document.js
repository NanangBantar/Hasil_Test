// core lib
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const client = require("../../redis/redis");
const { v4: uuidv4 } = require('uuid');

// additional lib
const { check, validationResult } = require("express-validator");
const cookieParser = require('cookie-parser');

dotenv.config();
router.use(cookieParser('curent_folder'));

const Document = require("../../models/Document");

router.post("/", [
    check('name', 'name is required').not().isEmpty(),
    check('type', 'type is required').not().isEmpty(),
    check('content', 'content is required').not().isEmpty(),
    check('timestamp', 'timestamp is required and must be integer value').not().isString().isInt(),
    check('share', 'share is required').not().isEmpty(),
], async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                try {
                    const folder_id = req.signedCookies['folder'];
                    const { name, type, content, timestamp, share } = req.body;
                    const document = new Document({
                        id : uuidv4(),
                        name,
                        type,
                        folder_id,
                        content,
                        timestamp,
                        owner_id: verifyToken.user_id,
                        share,
                        company_id: verifyToken.user_id.company_id
                    });
                    await document.save();
                    res.status(201).json({
                        error: false,
                        message: "Success set document",
                        data: { document }
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

router.put("/", [
    check('id', 'id is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
    check('type', 'type is required').not().isEmpty(),
    check('content', 'content is required').not().isEmpty(),
    check('timestamp', 'timestamp is required and must be integer value').not().isString().isInt(),
    check('share', 'share is required').not().isEmpty(),
], async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }

                try {
                    const folder_id = req.signedCookies['folder'];
                    const { id, name, type, content, timestamp, share } = req.body;
                    const document = {
                        id,
                        name,
                        type,
                        folder_id,
                        content,
                        timestamp,
                        owner_id: verifyToken.user_id,
                        share,
                        company_id: verifyToken.user_id.company_id
                    };
                    await Document.updateOne(
                        { id },
                        { ...document }
                    );
                    res.status(201).json({
                        error: false,
                        message: "Success set document",
                        data: { document }
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

router.get("/:document_id", async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            const { document_id } = req.params;
            if (!err) {
                try {
                    client.get("document", async (err, document) => {
                        if (err) throw err;
                        if (document | document !== null) {
                            if(JSON.parse(document).id !== document_id){
                                let document = await Document.findOne({ id: document_id, type: "document" }).select("-_id -__v");
                                client.set("document", JSON.stringify(document));
                            }
                            res.status(201).json({
                                error: false,
                                message: "Success get document",
                                data: typeof document == "string" ? JSON.parse(document) : document
                            });
                        } else {
                            let document = await Document.findOne({ id: document_id, type: "document" }).select("-_id -__v");
                            client.set("document", JSON.stringify(document));

                            res.status(201).json({
                                error: false,
                                message: "Success get document",
                                data: document
                            });
                        }
                    });
                } catch {
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

router.delete("/", [
    check('id', 'id is required').not().isEmpty()
], async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }
                try {
                    const { id } = req.body;
                    const document = await Document.findOneAndDelete({ id, type: "document" });
                    client.del("document");
                    res.status(201).json({
                        error: false,
                        message: document ? "Success delete document" : "Unable to delete, document not found...!",
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