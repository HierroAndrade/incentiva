const mongoose = require('mongoose');
const { messageSchema } = require("./message.js")

const Chat = mongoose.model("Chat", new mongoose.Schema({

    user2: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    messages: {
        type: [messageSchema],
        default: new Array()
    }

}))

module.exports = Chat;