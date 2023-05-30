//require modules
const express = require('express');
const morgan = require('morgan');
const tradeRoutes = require('./routes/tradeRoutes')
const mainRoute = require('./routes/mainRoute')
const userRoutes = require('./routes/userRoute')
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

// create application
const app = express();

//configure application
let port = 8000;
let host = 'localhost';
app.set('view engine','ejs')

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/project',
{useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
})
})
.catch(err => console.log(err.message));

//mount middleware
app.use(
    session({
        secret: "somerandomstringfornow",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/project'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.get('/',(req, res) => {
res.render('index')
});
app.use('/',mainRoute);
app.use('/trades',tradeRoutes);
app.use('/users', userRoutes);

//should be last in the routes..just above listen

app.use((req,res,next)=> {
    let err = new Error('The server cannot locate '+req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) =>{
    console.log(err.stack)
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server error");
    }
    res.status(err.status);
    res.render('error',{error:err});
});