var express = require('express');
var cors = require("cors");

var app = express();
app.use(cors());

var puzzleFinished = false;

app.get('/puzzle', function(req, res){

    var a = req.query["puzzleComplete"];
    if(a == 1) {
        console.log("request received, puzzle is complete " + a);
        puzzleFinished = true;
        res.send("Puzzle complete");
    }
    else
        res.send("Puzzle not complete");
});


app.get('/checkPuzzle', function(req, res){

    console.log("request received, is puzzle is complete?");

    result = puzzleFinished;

    if(puzzleFinished)
        puzzleFinished = false;

    res.send(result);

});




app.listen('1337')


