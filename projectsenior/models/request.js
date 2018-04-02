var mongoose = require("mongoose")
require('mongoose-double')(mongoose)
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var request = mongoose.Schema({
    Username : String,
    Providername : String,
    offerId : {type : Schema.Types.ObjectId , ref : 'offer'},
    latitude : {type: Schema.Types.Double,default:0.01},
    longitude : {type: Schema.Types.Double,default:0.01},
    Time : Date,
    statusFlag : Number, //1,2,3,4,5
    typeservice : Number
})

module.exports = mongoose.model("request",request)