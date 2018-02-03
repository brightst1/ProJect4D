var mongoose = require("mongoose")
var ObjectId = mongoose.Types.ObjectId;

var request = mongoose.Schema({
    Username : String,
    Providername : String,
    Service_id : {type : Schema.Types.ObjectId , ref : 'service'},
    location : { lat : Number, long:Number }

})

module.exports = mongoose.model("request",request)