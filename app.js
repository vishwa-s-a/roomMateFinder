const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const PORT=process.env.PORT || 3000;
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.ATLAS_URL,{useNewUrlParser:true});//extra true thing is for removing deprecation warning
//creating a new schema
const mateSchema={
  name:String,
  branch:String,
  program:String,
  year:Number,
  block:String,
  phoneNumber:Number,
  cgpa:Number,
  email:String
};

//creating a model(in db language creating a collection)
const Mate= new mongoose.model("Mate",mateSchema);

app.get("/", function (req, res) {
    res.render("index");
});

app.get("/about", function (req, res) {
    res.render("about");
})

app.get("/register", function (req, res) {
    res.render("register");
})

app.get("/:customListName", function (req, res) {
    const parameters = req.params.customListName;
    const paraLength = parameters.length;
    if (paraLength <= 14) {
        res.render("failure", { parameter: "Sorry web-page not found" });
    }
    else {
        const block = parameters.slice(0, 1);
        const program = parameters.slice(1, 6);
        const year = parameters.slice(6, 7);
        const id = parameters.slice(7);
        Mate.find({ _id: id }, function (err, foundlist) {
            if (foundlist.length !== 0) {
                Mate.find({ block: block, program: program, year: year }, function (err, foundLists) {
                    if (!err) {
                        if (foundLists[0]._id === id && foundLists.length === 1) {
                            res.render("failure", { parameter: "Sorry couldn't find any room mate" });
                        }
                        else {
                            res.render("result", { result: foundLists, parameter: id });
                        }
                    }

                });
            }
            else {
                res.render("failure", { parameter: "Sorry web-page not found" });
            }
        });
    }
});

app.post("/", function (req, res) {
    const email = req.body.email;
    const name = req.body.name;
    Mate.findOne({ name: name, email: email }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                res.render("failure", { parameter: "User not registered, so please go back and register" });
            }
            else {
                const block = foundList.block;
                const year = foundList.year;
                const program = foundList.program;
                const query = block + program + year + foundList.id;
                console.log(query);
                res.redirect("/" + query);

            }

        }

    });
});

app.post("/register", function (req, res) {
    const newMate = new Mate({
        name: req.body.name,
        branch: req.body.branch,
        program: req.body.programme,
        year: req.body.year,
        block: req.body.block,
        phoneNumber: req.body.phoneNumber,
        cgpa: req.body.cgpa,
        email: req.body.emailId
    });
    const query = newMate.block + newMate.program + newMate.year;
    Mate.findOne({ email: newMate.email }, function (err, found) {
        if (!err) {
            if (found) {
                res.render("failure", { parameter: "Entered email-id is already registered, try to give new email-id" });
            }
            else {
                newMate.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.redirect("/" + query + newMate.id);
                    }
                });
            }
        }
    });

});

app.listen(PORT, function () {
    console.log("Server started on port 3000");
});



