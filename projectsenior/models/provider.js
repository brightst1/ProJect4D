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
    job       : Number // 1,2,3,4,5,6,7
})

module.exports = mongoose.model("provider",provider)