const mongoose = require("mongoose");

let currentTime = new Date().getTime();

const UserSchema = new mongoose.Schema({
    iss: {
        type: String,
        required: true
    },
    iat: {
        type: Number,
        required: true
    },
    exp: {
        type: Number,
        required: true
    },
    aud: {
        type: String,
        require: true
    },
    sub: {
        type: String,
        require: true
    },
    company_id: {
        type: String,
        require: true
    },
    user_id: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    timestamps:{
        type: Number,
    }
});

module.exports = User = mongoose.model("user", UserSchema);

