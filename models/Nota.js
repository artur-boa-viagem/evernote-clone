const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Nota = new Schema({
    titulo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    etiquetas: [{
        type: Schema.Types.ObjectId,
        ref: "etiquetas",
        required: false
    }]
},{timestamps: true})

mongoose.model("notas", Nota)