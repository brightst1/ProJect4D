var mongoose = require("mongoose")
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var response = mongoose.Schema({
    offerId : {type: Schema.Types.ObjectId, ref:'offer'},
    providername : String,
    Username: String,
    typeservice : Number,
    Flag : Number
})

module.exports = mongoose.model("response",response)