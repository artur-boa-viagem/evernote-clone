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
require("./models/Etiqueta")
const Etiqueta = mongoose.model("etiquetas")
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
    Nota.find().lean().populate("etiquetas").populate("categoria").sort({createdAt: "desc"}).then((notas) => {
        res.render("admin/index", {notas: notas})
        //res.status(200).send({notas});
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao listar as notas" + err)
        res.render("admin/index")
    })
})

app.get("/create", (req, res) => {
    Etiqueta.find().lean().then((etiquetas) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/addnota", {etiquetas: etiquetas, categorias: categorias})
        })
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao carregar o formulário")
        res.redirect("/")
    }) 
})

app.get("/category", (req,res) => {
    res.render("admin/menucategorias")
})

app.get("/category/add", (req, res) => {
    res.render("admin/addcategoria")
})

app.post("/category/add/nova", (req,res) => {

    let erros = []
    if (!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome da categoria inválido"})
    }
    if (erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    }
    else{
        const novaCategoria = {
            nome: req.body.nome
        }
        Categoria.find().lean().then((categorias) => {
            vetor = ['']
            categorias.forEach((c) => {
                vetor.push(c.nome)
            })
            if (!(vetor.includes(req.body.nome))){
                new Categoria(novaCategoria).save().then(() => {
                    req.flash("success_msg", "categoria salva com sucesso")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "erro ao salvar categoria")
                    res.redirect("/")
                })
            }
            else{
                req.flash("error_msg", "já existe uma categoria com esse nome")
                res.redirect("/")
            }
        })
    }

})

app.get("/categories", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao exibir as categorias")
        res.redirect("/")
    })
})

app.get("/tags", (req, res) => {
    Etiqueta.find().lean().then((etiquetas) => {
        res.render("admin/etiquetas", {etiquetas: etiquetas})
        //console.log("ue")
    }).catch((err) => {
        console.log("hmmmmmmmmmmmm")
        //console.log(err)
        req.flash("error_msg", "houve um erro ao exibir as etiquetas")
        res.redirect("/")
    })
})

app.get("/tag", (req, res) => {
    res.render("admin/sei")
})

app.get("/tag/create", (req, res) => {
    res.render("admin/addetiqueta")
})

app.post("/tag/create/nova", (req, res) => {
    let erros = []
    if (!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome de etiqueta inválido"})
    }
    if (erros.length > 0){
        res.render("admin/addetiqueta", {erros: erros})
    }
    else{
        const novaEtiqueta = {
            nome: req.body.nome
        }
        Etiqueta.find().lean().then((etiquetas) => {
            vetor = ['']
            etiquetas.forEach((e) => {
                vetor.push(e.nome)
            })
            if (!(vetor.includes(req.body.nome))){
                new Etiqueta(novaEtiqueta).save().then(() => {
                    req.flash("success_msg", "etiqueta salva com sucesso")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "erro ao salvar etiqueta")
                    res.redirect("/")
                })
            }
            else{
                req.flash("error_msg", "já existe uma etiqueta com esse nome")
                res.redirect("/")
            }
        })
    }
})

/*app.get("/tags", (req, res) => {
    res.render("admin/etiquetas")
})*/

app.post("/create/nova", (req, res) => {
    //res.status(200).send(req.body);
    //console.log("1")
    let erros = []
    if(!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "título inválido"})
    }
    if(!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "conteúdo inválido"})
    }
    if(req.body.categoria == "0"){
        erros.push({texto: "categoria inválida. Por favor, crie uma categoria!"})
    }
    if (erros.length > 0){
        //console.log("2")
        Categoria.find().lean().then((categorias) => {
            Etiqueta.find().lean().then((etiquetas) => {
                res.render("admin/addnota", {erros: erros, categorias: categorias, etiquetas: etiquetas})
            })
        })
    }else{
    
        const novaNota = {
            //faz referencia ao "name" do input em /admin/addnota
            titulo: req.body.titulo,
            categoria: req.body.categoria,
            conteudo: req.body.conteudo,
            etiquetas: req.body.etiquetas
        }
        //console.log("3")
        new Nota(novaNota).save().then(() => {
            //console.log("4")
            req.flash("success_msg", "nota salva com sucesso")
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "erro ao salvar a nota")
            res.redirect("/")
        })
    }
})
app.get("/:id", (req, res) => {
    //console.log(req.params.id)
    Nota.find({_id: req.params.id}).populate("categoria").lean().then((nota) => {
        //console.log(nota)
        res.render("admin/nota", {nota: nota})
    }).catch((err) => {
        //console.log(err)
        req.flash("error_msg", "essa nota não existe")
        res.redirect("/")
    })
})

app.get("/:id/edit", (req, res) => {
    Nota.findOne({_id: req.params.id}).lean().then((nota) => {
        Categoria.find().lean().then((categorias) => {
            Etiqueta.find().lean().then((etiquetas) =>  {
                //console.log(nota)
                //console.log(nota.etiquetas)
                etiquetas.map((e) => {
                    e.valor = ""
                    if (nota.etiquetas){
                        nota.etiquetas.map((f) => {
                            //console.log(f._id.valueOf())
                            //console.log(f._id.valueOf() == e._id.valueOf())
                            if(f._id.valueOf() == e._id.valueOf()){
                                e.valor = "checked"
                            }
                        })
                        //console.log(e)
                    }
                })
                categorias.map((c) => {
                    c.sel = ""
                    if(nota.categoria._id.valueOf() == c._id.valueOf()){
                        c.sel = "selected"
                    }
                    //console.log(e)
                })
                res.render("admin/editnota", {nota: nota, categorias: categorias, etiquetas: etiquetas})
            })
        })
    }).catch((err) => {
        req.flash("error_msg", "essa nota não existe")
        res.redirect("/")
    })
})

app.post("/edit", (req, res) => {
    
    let erros = []
    if (!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "título inválido"})
    }
    if (!req.body.categoria || req.body.categoria == undefined || req.body.categoria == null){
        erros.push({texto: "categoria inválida"})
    }
    if (!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "conteúdo inválido"})
    }
    if (erros.length > 0){
        Nota.findOne({_id: req.body.id}).lean().then((nota) => {
            Categoria.find().lean().then((categorias) => {
                Etiqueta.find().lean().then((etiquetas) => {
                    etiquetas.map((e) => {
                        e.valor = ""
                        if (nota.etiquetas){
                            nota.etiquetas.map((f) => {
                                //console.log(f._id.valueOf())
                                //console.log(f._id.valueOf() == e._id.valueOf())
                                if(f._id.valueOf() == e._id.valueOf()){
                                    e.valor = "checked"
                                }
                            })
                        }
                        //console.log(e)
                    })
                    categorias.map((c) => {
                        c.sel = ""
                        if(nota.categoria._id.valueOf() == c._id.valueOf()){
                            c.sel = "selected"
                        }
                        //console.log(e)
                    })
                    res.render("admin/editnota", {erros: erros, nota: nota, categorias: categorias, etiquetas: etiquetas})
                })
            })
        })
    }
    else {
        Nota.findOne({_id: req.body.id}).then((nota) => {
            //console.log(nota)
            nota.titulo = req.body.titulo
            nota.categoria = req.body.categoria
            nota.conteudo = req.body.conteudo
            nota.etiquetas = req.body.etiquetas
    
            nota.save().then(() => {
                req.flash("success_msg", "Nota editada com sucesso!")
                res.redirect("/")
            }).catch((err) => {
                console.log(err)
                req.flash("error_msg", "Houve um erro interno ao salvar a edição")
                res.redirect("/")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a nota")
            res.redirect("/")
        })
    }
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
        //console.log(req.body.id)
        Nota.deleteMany({categoria: req.body.id}).lean().then(() => {
            req.flash("success_msg", "Nota deletada com sucesso")
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a nota")
        res.redirect("/")
    })
})

app.post("/delettag", (req, res) => {
    Etiqueta.deleteOne({_id: req.body.id}).lean().then(() => {
        req.flash("success_msg", "etiqueta apagada")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a nota")
        res.redirect("/")
    })
})

app.get("/categories/:id", (req, res) => {
    //console.log(req.params.id)
    Categoria.findOne({nome: req.params.id}).lean().then((categoria) => {
        if (categoria){
            Nota.find({categoria: categoria._id}).lean().then((notas) => {
                res.render("admin/notasdacategoria", {notas: notas, categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "erro ao listar as notas")
                res.redirect("/")
            })
        }
        else{
            req.flash("error_msg", "essa categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "erro ao listar categorias")
        res.redirect("/")
    })
})

app.get("/tags/:id", (req, res) => {
    Nota.find({etiquetas: req.params.id}).lean().then((notas) => {
        Etiqueta.findOne({_id: req.params.id}).lean().then((etiquetas) => {
            res.render("admin/notasdaetiqueta", {notas: notas, etiquetas: etiquetas})
        })
        //console.log(req.params.id)
        //console.log(notas)
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