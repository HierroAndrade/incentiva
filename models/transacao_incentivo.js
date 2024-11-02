const mongoose = require('mongoose');

const transacaoIncentivoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId
    },
    value: {
        type: Number
    },

    project: {
        type: mongoose.Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: "2h" }
    },


});

const TransacaoIncentivo = mongoose.model("transacaoIncentivo", transacaoIncentivoSchema)

module.exports = {
    TransacaoIncentivo, transacaoIncentivoSchema
}