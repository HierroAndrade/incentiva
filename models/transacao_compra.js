const mongoose = require('mongoose');

const transacaoCompraSchema = new mongoose.Schema({
    newOwner: {
        type: mongoose.Types.ObjectId
    },
    oldOwner: {
        type: mongoose.Types.ObjectId
    },
    value: {
        type: Number
    },
    project: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: "2h" }
    }

});

const TransacaoCompra = mongoose.model("transacaoCompra", transacaoCompraSchema)

module.exports = {
    TransacaoCompra, transacaoCompraSchema
}