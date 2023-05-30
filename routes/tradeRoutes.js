const express = require('express');
const controller = require('../controllers/tradecontroller');
const {isLoggedIn,isAuthor,isValidUser,isOfferedBy} = require('../middlewares/auth');
const {validateId,validateitem,validateResult} = require('../middlewares/validator')

const router = express.Router();

//send html form to create new trade item
router.get('/newTrade', isLoggedIn, controller.new);

router.get('/', controller.items);
//create a new trade
router.post('/', isLoggedIn, controller.create);

//show details of trade identified by id
router.get('/:id',validateId, controller.show);

//send html form for editing an existing trade
router.get('/:id/editTrade', isLoggedIn, isAuthor, validateId, controller.edit);

//update the trade item identified by the id
router.put('/:id', isLoggedIn, isAuthor, validateId, controller.update);

//delete trade item identified by the id
router.delete('/:id', isLoggedIn, isAuthor, validateId, controller.delete);

//To save or watch the trade
router.post( "/:id/save", validateId, isLoggedIn, validateResult, controller.save);

// To unsave a saved trade
router.delete( "/:id/savedelete", validateId, isLoggedIn, isValidUser, controller.savedelete);

// Trade button route
router.get("/:id/trade", validateId, isLoggedIn, controller.trade);

// Trade button route
router.get("/:id/tradeitem", isLoggedIn, controller.tradeitem);

//Manage trade
router.get("/:id/manage", validateId, isLoggedIn, controller.manage);

//delete manage request
router.delete( "/:id/deletemanageoffer",validateId, controller.deletemanageoffer);

// delete offer/ cancel it in profile 
router.delete( "/:id/deleteoffer",validateId,  isLoggedIn, isOfferedBy,controller.deleteoffer);

// accept a trade request
router.get("/:id/accept", validateId, isLoggedIn, controller.accept);

//reject a trade request
router.get("/:id/reject", validateId, isLoggedIn, controller.reject);



module.exports = router;