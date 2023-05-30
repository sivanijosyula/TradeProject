const model = require('../models/user');
const items = require('../models/item');
const save_model = require("../models/tradeSave");
const offer_model = require("../models/tradeOffer");

exports.new = (req, res)=>{
    res.render('./users/signup');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);//create a new trade item document
    user.save()//insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
    if(err.name === 'ValidationError' ) {
        req.flash('error', err.message);  
        res.redirect('/users/signup');
    }
    if(err.code === 11000) {
        req.flash('error', 'Email has been used');  
        res.redirect('/users/signup');
    }
    next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    if(!req.session.user) {
        res.render('./users/login');
    }
    else {
        req.flash('error','You are already logged in');
        res.redirect('/users/profile');
    }
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
    if (!user) {
        req.flash('error', 'wrong email address');  
        res.redirect('/users/login');
        } else {
        user.comparePassword(password)
        .then(result=>{
            if(result) {
                req.session.user = user._id;
                req.flash('success', 'You have successfully logged in');
                res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
        });     
        }     
    })
    .catch(err => next(err));

};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id),items.find({author: id}),items.find({ Saved: true }),
        save_model.find({ SavedBy: id }),items.find({ Offered: true }), offer_model.find({ OfferedBy: id }),
    ])
    .then(results=>{
        const [user, trades, saved, saves, offered, offers] = results;
        res.render('./users/profile', {user, trades, saved, saves, offered, offers});
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    }); 
};



