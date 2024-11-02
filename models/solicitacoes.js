const mongoose = require('mongoose');

const Solicitacao = mongoose.model("Solicitacao", new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

    project: {
        type: mongoose.Types.ObjectId,
        ref: "Project"
    },

    status: {
        type: String
    }
}, { versionKey: false }))

module.exports = Solicitacao;

