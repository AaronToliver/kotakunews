//Dependancies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
//models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
//scrapers
var request = require("request");
var cheerio = require("cheerio");
//promises promises
mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

//commented out until I connect with heroku
mongoose.connect();

var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

//Routes

app.get("/scrape", function(req, res) {
    //html request
    request("https://kotaku.com/", function(error, response, html){
        var $ = cheerio.load(html);
        $("h1.headline.entry-title.js_entry-title").each(function(i, element) {

            //result
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            //article model
            var entry = new Article(result);
            console.log(entry);
            //entry to the db
            entry.save(function(err, doc){
                if(err) {
                    console.log(err);
                }
                else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc){
        if (error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

app.get("/articles/:id", function(req, res) {
    Article.findOne({"_id": req.params.id})

    .populate("note")

    exec(function(error, doc){
        if (error) {
            console.log(error);
        }
        else {
            res.json(doc);
        }
    });
});

app.post("/articles/:id", function(req, res) {

    var newNote = new Note(req.body);

    newNote.save(function(error, doc){
        if (error) {
            console.log(error);
        }
        else {
            Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc_id })

            .exec(function(err, doc) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(doc);
                }
            });
        }
    });
});

app.listen(process.env.PORT || 3000, function() {
    console.log("App running: Port 3000");
});
