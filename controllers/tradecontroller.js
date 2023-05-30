const model = require('../models/item.js');
const save_model = require("../models/tradeSave");
const offer_model = require("../models/tradeOffer");

exports.new = (req,res) => {
    res.render('./trades/newTrade');

};

exports.items = (req,res,next) => {
  model.find()
    .then(trades => res.render('./trades/trades',{trades}))
    .catch(err => next(err));
};

exports.create = (req,res,next) => {
    let newitem = new model (req.body);
    newitem.author = req.session.user; 
    newitem.save() //insert document to database
    .then((newitem) => res.redirect('/trades'))
    .catch(err => {
        if(err.name === 'ValidationError') {
            //err.status = 400;
            req.flash('error',err.message);
            return res.redirect('/trades/newTrade');
        }
        next(err);});
  };

exports.show = (req,res,next) => {
  let id = req.params.id;
  // an onjectId is a 24-bit Hex string
  model.findById(id).populate('author','firstName lastName')
  .then(item => {
    if(item) {
      return res.render('./trades/trade',{item});
    } else {
        let err = new Error('Cannot find trade item with id  ' + id);
        err.status = 404;
        next(err);
      }
    })
  .catch(err => next(err))
}

exports.edit = (req,res,next)=>{
  let id = req.params.id;
  model.findById(id)
  .then(item => {
    if(item) {
      return res.render('./trades/editTrade',{item});
    } else {
      let err = new Error('Cannot find trade item with id ' + id);
      err.status = 404;
      next(err);
    }
  })
  .catch(err => next(err))
};

exports.update = (req,res,next) => {
  let item = req.body;
  let id = req.params.id;
  model.findByIdAndUpdate(id,item,{useFindAndModify: false,runValidators:true})
  .then( item => {
    if(item) {
      res.redirect('/trades/'+id);
    } else {
        let err = new Error('Cannot find a trade item with id ' + id);
        err.status = 404;
        next(err);
      }
    })
  .catch(err => {
    if(err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  });
};

exports.delete = (req,res,next) => {
  let id = req.params.id;
  model.findByIdAndDelete(id,{useFindAndModify: false})
  .then(item => {
    if(item) {
      res.redirect('/trades');
    } else {
      let err = new Error('Cannot find a trade item with id ' + id);
      err.status = 404;
      next(err);
    }
  })
  .catch(err => next(err))
};

/*exports.trade'''= (req,res)=>{
  console.log('meeeeeeeeee')
  model.find()
  .then(trades => res.render('/trades/trade', {trades}))
  .catch(err => next(err));
  };

//Get /trades.ejs
exports.trades = (req,res)=>{
  console.log('mee')
  model.find()
    .then(trades => res.render('/trades/trades',{trades}))
    .catch(err => next(err));
};*/

// Adding to watchlist
exports.save = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(
      id,
      { Saved: true },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.title;
      let newSaveItem = new save_model({
        title: item.title,
        category: item.category,
        status: item.status,
      });
      newSaveItem.SavedBy = req.session.user;
      save_model
        .findOne({ title: name })
        .then((item) => {
          if (!item) {
            newSaveItem
              .save()
              .then((newSaveItem) => {
                req.flash("success", "Trade Added to Watchlist");
                res.redirect("/users/profile");
              })
              .catch((err) => {
                if (err.name === "ValidationError") {
                  err.status = 400;
                }
                next(err);
              });
          } else {
            req.flash("error", "Trade is already saved");
            res.redirect("/save");
          }
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

//Remove from watchlist
exports.savedelete = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndUpdate(id, { Saved: false })
    .then((item) => {
      let name = item.title;
      save_model
        .findOneAndDelete({ title: name }, { useFindAndModify: false })
        .then((save) => {
          req.flash("success", "Trade removed from the Watchlist");
          res.redirect("back");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};


// Trade button
exports.trade = (req, res, next) => {
  let user = req.session.user;
  let iD = req.params.id;
  model.findByIdAndUpdate(
  iD,
      { status: "Offer Pending", Offered: true },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let newOfferItem = new offer_model({
        title: item.title,
        status: "Offer Pending",
        category: item.category,
        OfferedBy: user,
      });
      newOfferItem.save().then((offer) => {
        model
          .find({ author: user})
          .then((items) => {
            res.render("./trades/productTrade", { items });
          })
          .catch((err) => {
            next(err);
          });
      });
    })
    .catch((err) => {
      next(err);
    })
    .catch((err) => {
      next(err);
    });
};

exports.tradeitem = (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;
  Promise.all([
    model.findByIdAndUpdate(
      id,
      { status: "Offer Pending" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    ),
    offer_model.findOne({ OfferedBy: user }).sort({ _id: -1 }),
  ])
    .then((results) => {
      const [item, Offered] = results;
      let name = Offered.title;
      model
        .findByIdAndUpdate(
          id,
          { offerItem: name },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        )
        .then((item) => {
          req.flash("success", "Trade offer successfully created for a Trade");
          res.redirect("/users/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

//manage button
exports.manage = (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;
  model
    .findById(id)
    .then((item) => {
      if (item.offerItem === "") {
        let name = item.title;
        model
          .findOne({ offerItem: name })
          .then((item) => {
            res.render("./trades/manage", { item });
          })
          .catch((err) => {
            next(err);
          });
      } else {
        let name = item.offerItem;
        offer_model
          .findOne({ title: name })
          .then((offer) => {
            res.render("./trades/manageTrade", { item, offer });
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};

// deleting the manage offer request
exports.deletemanageoffer = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndUpdate(id, { status: "Available", offerItem: "" })
    .then((item) => {
      let name = item.offerItem;
      Promise.all([
        offer_model.findOneAndDelete({ title: name }),
        model.findOneAndUpdate(
          { title: name },
          { status: "Available", Offered: false }
        ),
      ])
        .then((results) => {
          const [offer, item] = results;
          req.flash("success", "Trade offer is cancelled");
          res.redirect("/users/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

//delete offer request
exports.deleteoffer = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { status: "Available", Offered: false },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.title;

      Promise.all([
        model.findOneAndUpdate(
          { offerItem: name },
          { status: "Available", offerItem: "" }
        ),
        offer_model.findOneAndDelete(
          { title: name },
          { useFindAndModify: false }
        ),
      ])
        .then((results) => {
          const [item, offer] = results;
          req.flash("success", "Trade offer has been cancelled");
          res.redirect("/users/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

// Accept an offer
exports.accept = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { status: "Traded" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.offerItem;

      Promise.all([
        model.findOneAndUpdate(
          { title: name },
          { status: "Traded" },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        ),
        offer_model.findOneAndDelete(
          { title: name },
          { useFindAndModify: false }
        ),
      ])
        .then((results) => {
          const [item, offer] = results;
          req.flash("success", "Trade offer has been successfully accepted");
          res.redirect("/users/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

// Reject an offer
exports.reject = (req, res, next) => {
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { status: "Available", offerItem: "" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.offerItem;
      Promise.all([
        model.findOneAndUpdate(
          { title: name },
          { status: "Available", Offered:false },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        ),
        offer_model.findOneAndDelete({ title: name }),
      ])
        .then((results) => {
          const [item, offer] = results;
          let name = item.title;
          let status = item.status;
          if (item.Saved) {
            save_model
              .findOneAndUpdate(
                { title: name },
                { status: status },
                {
                  useFindAndModify: false,
                  runValidators: true,
                }
              )
              .then((save) => {})
              .catch((err) => {
                next(err);
              });
          }
          req.flash("success", "Trade offer has been rejected");
          res.redirect("/users/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};