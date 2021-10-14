const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "folder"
    },
    content: {
        type: Object,
        default: undefined
    },
    timestamp: {
        type: Number,
        default: new Date().getTime()
    },
    owner_id: {
        type: String
    },
    share: {
        type: Array
    },
    company_id: {
        type: String
    }
}, { minimize: false });

module.exports = Folder = mongoose.model("folder", FolderSchema);

