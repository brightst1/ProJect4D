var express = require('express')
var mongoose = require("mongoose")
var UserController = require("./controllers/Users")
var ProviderController = require("./controllers/providers.js")
var app = express()
var router = express.Router()
var bodyParser = require('body-parser')

var mongoDB = 'mongodb://127.0.0.1/ProJect';
mongoose.connect(mongoDB, {
  useMongoClient: true
});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.urlencoded({ extended: false}))

app.use(bodyParser.json())

app.use("/api",router)
router.route("/getUser").get(UserController.getUser)
router.route("/addUser").post(UserController.addUser)
router.route("/addValue").post(UserController.addValue)
router.route("/userLogin").post(UserController.userLogin)
router.route("/registerUser").post(UserController.registerUser)
router.route("/testjwt").post(UserController.testjwt)
router.route("/userLogout").post(UserController.userLogout)
router.route("/Tokentest").post(UserController.Tokentest)

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})