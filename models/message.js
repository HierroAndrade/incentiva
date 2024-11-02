const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true
    }
});

const Message = mongoose.model("Message", messageSchema)

module.exports = {
    Message, messageSchema
}