//Carregando módulos
const express = require('express')
const handlebars = require("express-handlebars")
const mongoose = require("mongoose")
const app = express()
//const rotas = require("./routes/rotas")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Nota")
const Nota = mongoose.model("notas")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const db = require("./config/db")

//Configurações
    //Sessão
    app.use(session({
        secret: "evernote",
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    //Falecido Body Parser
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    //Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(() => {
        console.log("conectado ao mongo")
    }).catch((err) => {
        console.log("erro ao se conectar com o mongo " + err)
    })
    //Public
    app.use(express.static(path.join(__dirname + "/public")))


//Rotas
app.get("/", (req, res) => {
    Nota.find().lean().sort({data: "desc"}).then((notas) => {
        res.render("admin/index", {notas: notas})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao listar as notas")
        res.render("/")
    })
})

app.get("/create", (req, res) => {
    res.render("admin/addnota")
})

app.get("/categories", (req, res) => {
    Categoria.find().lean().then((categorias) => {

        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao exibir as categorias")
        res.redirect("/")
    })
})

/*app.get("/tags", (req, res) => {
    res.render("admin/etiquetas")
})*/

app.post("/create/nova", (req, res) => {

    let erros = []
    if(!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "título inválido"})
    }
    if(!req.body.categoria || req.body.categoria == undefined || req.body.categoria == null){
        erros.push({texto: "categoria inválida"})
    }
    if(!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "conteúdo inválido"})
    }
    if (erros.length > 0){
        res.render("admin/addnota", {erros: erros})
    }
    const novaCategoria = {
        nome: req.body.categoria
    }

    const novaNota = {
        //faz referencia ao "name" do input em /admin/addnota
        titulo: req.body.titulo,
        categoria: req.body.categoria,
        conteudo: req.body.conteudo
    }
    new Nota(novaNota).save().then(() => {
        req.flash("success_msg", "nota salva com sucesso")
        Categoria.find().lean().then((categorias) => {
            array = ['']
            categorias.forEach((e) =>{
                 array.push(e.nome)
                })
            if (!(array.includes(req.body.categoria))){
                new Categoria(novaCategoria).save().then(() => {
                    res.redirect("/")
                })
            }
            else{
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "houve um erro ao exibir as categorias")
            res.redirect("/")
        })
        
    }).catch((err) => {
        req.flash("error_msg", "erro ao salvar a nota")
        res.redirect("/")
    })
})
app.get("/:id", (req, res) => {
    Nota.findOne({_id: req.params.id}).lean().then((nota) => {
        res.render("admin/nota", {nota: nota})
    }).catch((err) => {
        req.flash("error_msg", "essa nota não existe")
        res.redirect("/")
    })
})

app.get("/:id/edit", (req, res) => {
    Nota.findOne({_id: req.params.id}).lean().then((nota) => {
        res.render("admin/editnota", {nota: nota})
    }).catch((err) => {
        req.flash("error_msg", "essa nota não existe")
        res.redirect("/")
    })
})

app.post("/edit", (req, res) => {
    Nota.findOne({_id: req.body.id}).then((nota) => {
        nota.titulo = req.body.titulo,
        nota.categoria = req.body.categoria,
        nota.conteudo = req.body.conteudo

        nota.save().then(() => {
            req.flash("success_msg", "Nota editada com sucesso!")
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição")
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a nota")
        res.redirect("/")
    })
})

app.post("/delet", (req, res) => {
    Nota.deleteOne({_id: req.body.id}).lean().then(() => {
        req.flash("success_msg", "Nota deletada com sucesso")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a nota")
        res.redirect("/")
    })
})

app.post("/deletcategoria", (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).lean().then(() => {
        console.log(req.body.nome)
        Nota.deleteMany({categoria: req.body.nome}).lean().then(() => {
            req.flash("success_msg", "Nota deletada com sucesso")
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a nota")
        res.redirect("/")
    })
})

app.get("/categories/:nome", (req, res) => {
    Nota.find({categoria: req.params.nome}).lean().then((notas) => {
        console.log(req.params.nome)
        console.log(notas)
        res.render("admin/notasdacategoria", {notas: notas})
    }).catch((err) => {
        req.flash("error_msg", "erro")
        res.redirect("/")
    })
})

//app.use("/principal", rotas)
//Outros
const porta = process.env.PORT || 8081
app.listen(porta, () => {
    console.log("servidor rodando!")
})