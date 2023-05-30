const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req,res,next) => {
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    }
}

exports.validateSignUp = [body('firstName','First name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max: 64})
];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max:64})
];
  
exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}

exports.validateitem = [
    body("category", "Category cannot be empty").notEmpty().trim().escape(),
    body("title", "Title cannot be empty").notEmpty().trim().escape(),
    body("details", "Details must be atleast 10 characters long")
      .isLength({ min: 10 })
      .trim()
      .escape(),
    body("imageurl", "imageurl cannot be empty")
      .notEmpty(),
  ];