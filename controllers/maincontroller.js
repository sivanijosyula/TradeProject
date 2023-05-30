const model = require('../models/item.js');

exports.index = (req,res) => {
    res.render('./index');
    };

exports.newTrade = (req,res)=>{
    res.render('./newTrade');
    };

//exports.trade = (req,res)=>{
    //res.render('./trade');
   // };

//exports.trades = (req,res)=>{
    //res.render('./trades');
   // };

//Get /about.ejs
exports.about =(req,res)=>{
    res.render('./about');
    };

//Get /contact.ejs 
exports.contact =(req,res)=>{
    res.render('./contact');
    };

//Get /terms.ejs 
exports.terms =(req,res)=>{
    res.render('./terms');
    };