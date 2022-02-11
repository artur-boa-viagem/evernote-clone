if (process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://artur:evernote-clone@cluster0.7hs0o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/clone-evernote"}
}