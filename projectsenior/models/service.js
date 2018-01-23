var mongoose = require("mongoose")


var service = mongoose.Schema({
    detail  = String,
    price   = String,
    statusFlag = { type : Number , default : 0} //0 wait , 1 going , 2 done
})

module.exports = mongoose.model("service",service)