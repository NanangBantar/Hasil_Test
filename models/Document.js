const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
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
        default: "document"
    },
    folder_id: {
        type: String,
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

module.exports = Document = mongoose.model("document", DocumentSchema);