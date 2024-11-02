const mongoose = require('mongoose');

const User = mongoose.model("User", new mongoose.Schema({

    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },

    username: {
        type: String,
        unique: true,
        sparse: true
    },

    bio: {
        type: String,
        maxLength: 1000
    },
    profile_img: {
        type: String
    },
    projects_liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    verified: {
        type: Boolean
    },
    verified: {
        type: Boolean
    }

}, { versionKey: false }))

module.exports = User;

