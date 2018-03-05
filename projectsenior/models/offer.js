var mongoose = require("mongoose")
var ObjectId = mongoose.Types.ObjectId

var offer = mongoose.Schema({
    typeservice : Number,
    detail : String,
    Username : String,
    status : Number, //1 waiting , 2match
    response_id : {type: Schema.Types.ObjectId, ref:'response'} //ของprovider 
})

module.exports = mongoose.model("offer",offer)