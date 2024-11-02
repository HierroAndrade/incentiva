const mongoose = require('mongoose');
const { messageSchema } = require("./message.js")

const Project = mongoose.model("Project", new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    quick_description: {
        type: String,
        required: true,
        maxLength: 1000
    },

    localization: {
        type: String,
        required: true
    },

    field: {
        type: String,
        required: true,
    },

    instituition: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        required: true,
    },

    pix: {
        type: String
    },

    type_of_project: {
        type: String,
        required: true,
    },

    background_img: {
        type: String
    },

    logo_img: {
        type: String
    },

    goal: {
        type: String
    },

    knowledge_used: {
        type: String
    },

    reason_for_creation: {
        type: String
    },

    society_impacts: {
        type: String
    },

    progress: {
        type: Number
    },

    team_members: [{
        type: mongoose.Types.ObjectId,
        default: new Array(),
        ref: "User"
    }],

    extra_informations: {
        type: String
    },

    links: {
        type: [
            {
                name: { type: String },
                link: { type: String }
            }
        ],
        default: new Array()
    },

    preco: {
        type: Number
    },

    incentivos: [{
        type: { person_id: { type: mongoose.Types.ObjectId, ref: "User" }, value: Number },
        default: new Array(),

    }],


    extra_imgs: {
        type: [String],
        default: new Array()
    },

    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],


}));

module.exports = Project;