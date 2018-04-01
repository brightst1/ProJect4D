var mongoose = require("mongoose")
require('mongoose-double')(mongoose)
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var offer = mongoose.Schema({
    typeservice : Number,
    detail : {type:Object,default:{}},
    /*
        detail : {
            type_info : "",
            moreDetail : "",
            toolsCheck : "",
            problem : "",
            placeType : ""
        }
    */
    Username : String,
    //amount : String,
    status : Number, //1 waiting , 2match
    response_id : {type: Schema.Types.ObjectId, ref:'response'} //ของprovider 
})

module.exports = mongoose.model("offer",offer)