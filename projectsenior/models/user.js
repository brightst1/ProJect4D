var mongoose = require("mongoose")

var user = mongoose.Schema({
    name : String,
    lastname : String,
    Username : String,
    email : String,
    password : String,
    citizenId : String,
    flagLogin : {type : Boolean, default : false}
})

module.exports = mongoose.model("user",user)