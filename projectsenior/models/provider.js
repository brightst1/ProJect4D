var mongoose = require("mongoose")

var provider = mongoose.Schema({
    name      : String,
    lastname  : String,
    Username  : String,
    email     : String,
    password  : String,
    citizenId : String,
    token     : {type: String, default:""},
    detail    : String,
    typeservice       : Number, // 1,2,3,4,5,6,7
    Telno     : String
})

module.exports = mongoose.model("provider",provider)