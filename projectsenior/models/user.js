var mongoose = require("mongoose")

var user = mongoose.Schema({
    name      : String,
    lastname  : String,
    Username  : String,
    email     : String,
    password  : String,
    citizenId : String,
    token     : {type: String, default:""},
    number    : String
})

module.exports = mongoose.model("user",user)