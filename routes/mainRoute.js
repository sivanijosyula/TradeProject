const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

router.get('/', controller.index);

//GET /stories: send all stories to user
router.get('/index',controller.index);

//Get /about.ejs
router.get('/about',controller.about);
//router.get('/about.ejs',(req,res)=>{res.send('Get about.ejs');});

//Get /contact.ejs 
router.get('/contact',controller.contact);
//router.get('/contact.ejs',(req,res)=>{res.send('Get contact.ejs');});

//Get /terms.ejs 
router.get('/terms',controller.terms);

module.exports = router;