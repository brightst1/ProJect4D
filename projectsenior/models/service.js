var mongoose = require("mongoose")
require('mongoose-double')(mongoose)
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId


var service = mongoose.Schema({
    name    : String,
    detail  : String,
    price   : String,
    statusFlag : { type : Number , default : 0}, //0 wait , 1 going , 2 done
    owner   : {type: Schema.Types.ObjectId, ref:'provider'},
    latitude : {type: Schema.Types.Double,default:0.01},
    longitude : {type: Schema.Types.Double,default:0.01},
    typeService : Number //1,2,3,4
})

module.exports = mongoose.model("service",service)