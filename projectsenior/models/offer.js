var mongoose = require("mongoose")

var offer = mongoose.Schema({
    typeservice = Number,
    detail = String,
    Username = String,
    status = Number
})

module.exports = mongoose.model("offer",offer)