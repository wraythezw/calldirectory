#!/usr/bin/node

var mysql	= require('mysql');
var express	= require('express');
var app		= express();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

// node start.js host user password database
var connection	= mysql.createConnection({
	connectionLimit	: 100,
 	host		: process.argv[2],
	user		: process.argv[3],
	password	: process.argv[4],
	database	: process.argv[5]
});
/*var connection	= mysql.createConnection({
	connectionLimit	: 100,
 	host		: '192.168.122.182',
	user		: 'root',
	password	: 'jammers32',
	database	: 'asterisk'
});
*/
function update_db(){
 connection.connect(function(err){
  if(!err){
   console.log("DB Connection success");
  } else {
   console.log("Error connection to DB");
  }
 });
 connection.query('SELECT extension,name from users;',function(err,rows){
  if(!err){
   myCache.set("freepbx-directory",rows,function(err,success){
    if ( !err && success){
     console.log("Stored FPBX extensions in CACHE");
    }
   });
  }
 });
 connection.end();
}
function get_directory(req,res){
   var builder	= require('xmlbuilder');
   var doc		= builder.create("YealinkIPPhoneDirectory",{ encoding: 'utf-8' });
   doc.att('xmlns', 'http://www.w3.org/2005/Atom')
  // doc.com('Dynamic Extension List. Generated from FreePBX user database');
  // doc.com('Author : Keith Rose');
  // doc.com('E-Mail : keith.rose.zw@gmail.com');
   var rows = myCache.get("freepbx-directory");
   for(var i in rows){
    var extension=rows[i]["extension"];
    var name=rows[i]["name"];
    var row = doc.ele('DirectoryEntry')
     .ele('Name',name).up()
     .ele('Telephone',extension).up()	 
   }
   res.set('Content-Type', 'text/xml');
   res.send(doc.end({pretty:true}));
//   console.log(doc.end({pretty:true}));
}
update_db();

app.get('/directory',function(req,res){-
	get_directory(req,res);

});

app.get('/',function(req,res){-
  res.send("Contact keith@nationalit.co.zw for usage");
});

app.listen(3000);

