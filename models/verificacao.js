const mongoose = require('mongoose');

const Verificacao = mongoose.model("Verificacao", new mongoose.Schema({

    email: {
        type: String
    },

    codigo: {
        type: Number
    },

    status: {
        type: String
    }

}))

module.exports = Verificacao;