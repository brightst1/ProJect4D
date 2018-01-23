var mongoose = require("mongoose")

var service = mongoose.Schema({
    detail  = String,
    
})

module.exports = mongoose.model("service",service)