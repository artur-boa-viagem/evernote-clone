const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Etiqueta = new Schema({
    nome: {
        type: String,
        required: false
    }
})

mongoose.model("etiquetas", Etiqueta)