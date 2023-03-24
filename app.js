const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const PORT=process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/roomMateDB");//extra true thing is for removing deprecation warning
//creating a new schema
const mateSchema={
  name:String,
  branch:String,
  program:String,
  year:Number,
  block:String,
  phoneNumber:Number,
  cgpa:Number
};

//creating a model(in db language creating a collection)
const Mate= new mongoose.model("Mate",mateSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/about",function(req,res){
    res.render("about");
})

app.get("/:customListName",function(req,res){
    const parameters=req.params.customListName;
    const block=parameters.slice(0,1);
    const program=parameters.slice(1,6);
    const year=parameters.slice(6,7);
    const id=parameters.slice(7);
    Mate.find({block:block,program:program,year:year},function(err,foundLists){
        if(!err){
            if(foundLists[0].id=== id)
            {
                res.render("failure");
            }
            else{
                res.render("result",{result:foundLists,parameter:id});
            }
        }
    
    });
});


app.post("/",function(req,res){
    const newMate= new Mate({
        name:req.body.name,
        branch:req.body.branch,
        program:req.body.programme,
        year:req.body.year,
        block:req.body.block,
        phoneNumber:req.body.phoneNumber,
        cgpa:req.body.cgpa
    });
    const query=newMate.block+newMate.program+newMate.year;
    newMate.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/"+query+newMate.id);
        }
    });
});

app.listen(PORT, function() {
    console.log("Server started on port 3000");
  });