const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    title:{type:String, required:[true,'title is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    category:{type:String, required:[true,'category is required']},
    pickupby:{type:String},
    expiry:{type:String},
    pincode:{type:Number, required:[true,'pincode is required'],minLength: [5,'The pincode should be 5 digits'], maxLength: [5,'The pincode should be 5 digits']},
    quantity:{type:Number, required:[true,'quantity is required']},
    description:{type:String, required:[true,'quantity is required'], minLength: [10,'The description should be atleast 10 digits']},
    image:{type:String},
    status:{type:String, default:'Available'},
    offerItem: {type: String, default:''},
    Saved: {type: Boolean, default:false},
    Offered: {type: Boolean, default:false}
},
{timestamps: true}
);
//collection name is trades in the database
module.exports = mongoose.model('Trade',tradeSchema);