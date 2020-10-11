var express= require('express');
var app=express();

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;  //for mongodb

//connecting server file for awt
let server=require('./server');    //including serving because my server is listening on some port
let config=require('./config');
let middleware=require('./middleware');    //for verifying token and giving access to request
const response=require('express');

//database conection
const dbName='dheraj';
const url='mongodb://localhost:27017';
let db

MongoClient.connect(url, {useUnifiedTopology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
    console.log("connected.....");
});

//fetching hospital details
app.get('/hospitaldetails',middleware.checkToken,function(req,res){
    console.log("Fetching data from the hospital collection ");
    var data = db.collection('hospital').find().toArray()
    .then(result => res.json(result));
});

// fetching Ventiolator details
app.get('/ventilatordetails',middleware.checkToken,function(req,res) {
    console.log("Fetching data from the ventiloators collection ");
    var ventilatordetail = db.collection('ventilator').find().toArray()
    .then(result => res.json(result));

});


//search ventilators by status
app.post('/searchventilatorbystatus',middleware.checkToken,(req,res) =>{
    console.log("searching ventilator by status");
    var status = req.body.status;
    console.log(status);
    var ventilatordetail = db.collection('ventilator')
    .find({"status": status}).toArray().then(result => res.json(result));

});


//searching ventilator by name of the hospital
app.post('/searchventilatorbyname',middleware.checkToken,(req,res) => {
    console.log("searching hospital by name");
    var name =req.query.name;
    console.log(name);
    var ventilatordetail = db.collection('ventilator').find({'name':new RegExp(name,'i')}).toArray()
    .then(result => res.json(result));
});

//updating ventilator details 
app.put('/updateventilatordetails',middleware.checkToken,(req,res) =>{
    var ventid = { ventilatorId: req.body.ventilatorId };
    console.log(ventid);
    var newvalues = { $set: { status: req.body.status } };
    db.collection('ventilator').updateOne(ventid, newvalues,function (err, result){
        res.json('1 document updated in collection');
        if(err) throw err;
    });
});

//add ventilator
app.put('/addventilatorbyuser',middleware.checkToken, (req,res) => {
    var hid= req.body.hid;
    var ventilatorid=req.body.ventilatorid;
    var status=req.body.status;
    var name=req.body.name;

    var item= 
    {
        hid:hid, ventilatorid:ventilatorid, status:status, name:name
    };
    db.collection('ventilator').insertOne(item, function (err, result){
        res.json('new item inserted');
    });
});

//delete ventilator by ventilatorid
app.delete('/delete',middleware.checkToken,(req,res) => {
    var myquery = req.query.ventilatorId;
    console.log(myquery);

    var myquery1 = { ventilatorId: myquery };
    db.collection('ventilator').deleteOne(myquery1,function (err,obj)
    {
        if(err) throw err;
        res.json("1 document is deleted from collection");
    });
});

app.listen(8080);