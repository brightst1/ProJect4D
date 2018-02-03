var mongoose = require("mongoose")

var provider = mongoose.Schema({
    name      : String,
    lastname  : String,
    Username  : String,
    email     : String,
    password  : String,
    citizenId : String,
    token     : {type: String, default:""},
    detail    : String
})

module.exports = mongoose.model("provider",provider)