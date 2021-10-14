// core lib
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const client = require("../../redis/redis");

// addtional lib
const cookieParser = require('cookie-parser');
const { check, validationResult } = require("express-validator");

const router = express.Router();
router.use(cookieParser('curent_folder'));
dotenv.config();

const Folder = require("../../models/Folder");

router.post("/", [
    check('id', 'id is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
    check('timestamp', 'timestamp is required and must be integer value').not().isString().isInt(),
], async (req, res, next) => {
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
                    const { id, name, timestamp } = req.body;
                    let folder = await Folder.findOne({ id, type: "folder" });

                    res.cookie('folder', id, { signed: true, httpOnly: true });

                    if (folder) {
                        folder = {
                            id,
                            name,
                            timestamp,
                            owner_id: verifyToken.user_id,
                            company_id: verifyToken.company_id
                        }

                        await Folder.updateOne(
                            { id, type: "folder" },
                            { ...folder }
                        );

                        res.status(201).json({
                            error: false,
                            message: "Success set document",
                            data: {
                                folder: folder
                            }
                        });
                    } else {
                        const folder = new Folder({
                            id,
                            name,
                            type: "folder",
                            content: {},
                            timestamp,
                            owner_id: verifyToken.user_id,
                            share: [],
                            company_id: verifyToken.company_id
                        });
                        await folder.save();
                        res.status(201).json({
                            error: false,
                            message: "folder created",
                            data: folder
                        });
                    }
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

router.get("/:folder_id", async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                try {
                    client.get("updated", async (err, folder) => {
                        if (err) throw err;
                        if (folder | folder !== null) {
                            if(JSON.parse(folder).id !== req.params.folder_id){
                                let folder = await Folder.findOne({ id: req.params.folder_id }).select("-_id");
                                client.set("updated", JSON.stringify(folder));
                            }
                            let fixFolder = typeof folder == "string" ? JSON.parse(folder) : folder;
                            const data = {
                                id: fixFolder.id,
                                name: fixFolder.name,
                                type: fixFolder.type,
                                folder_id: fixFolder.id,
                                content: fixFolder.content,
                                timestamp: fixFolder.timestamp,
                                owner_id: fixFolder.owner_id,
                                share: fixFolder.share
                            };

                            const newData = [
                                data,
                                {
                                    id: data.id,
                                    name: data.name,
                                    type: data.type,
                                }
                            ];
                            res.status(201).json({
                                error: false,
                                data: newData
                            });
                        } else {
                            let folder = await Folder.findOne({ id: req.params.folder_id }).select("-_id");
                            client.set("updated", JSON.stringify(folder));
                            const data = {
                                id: folder.id,
                                name: folder.name,
                                type: folder.type,
                                folder_id: folder.id,
                                content: folder.content,
                                timestamp: folder.timestamp,
                                owner_id: folder.owner_id,
                                share: folder.share
                            };

                            const newData = [
                                data,
                                {
                                    id: data.id,
                                    name: data.name,
                                    type: data.type,
                                }
                            ];

                            res.status(201).json({
                                error: false,
                                data: newData
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

router.delete("/:id", async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], process.env.ACCESS_TOKEN, async (err, verifyToken) => {
            if (!err) {
                try {
                    const id = req.params.id;
                    const folder = await Folder.findOneAndDelete({ id, type: "folder" });
                    client.del("updated");
                    res.status(201).json({
                        error: false,
                        message: folder ? "Success delete folder" : "Unable to delete, folder not found...!",
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