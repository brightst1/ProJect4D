var mongoose = require("mongoose")
require('mongoose-double')(mongoose)
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var request = mongoose.Schema({
    Username : {type: Schema.Types.ObjectId, ref:'user'},
    Providername : {type: Schema.Types.ObjectId, ref:'provider'},
    Service_id : {type : Schema.Types.ObjectId , ref : 'service'},
    latitude : {type: Schema.Types.Double,default:0.01},
    longitude : {type: Schema.Types.Double,default:0.01},
    Time : Date,
    statusFlag : Number //1,2,3,4,5
})

module.exports = mongoose.model("request",request)