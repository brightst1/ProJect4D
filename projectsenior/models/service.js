var mongoose = require("mongoose")


var service = mongoose.Schema({
    name    : String,
    detail  : String,
    price   : String,
    statusFlag : { type : Number , default : 0}, //0 wait , 1 going , 2 done
    owner   : {type: Schema.type.ObjectId, ref:'provider'},
    lat : {type:SchemaTypes.Double,default:0},
    long : {type:SchemaTypes.Double,default:0},
    typeService : Number
})

module.exports = mongoose.model("service",service)