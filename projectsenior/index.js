var express = require('express')
var mongoose = require("mongoose")
var UserController = require("./controllers/Users")
var ProviderController = require("./controllers/providers.js")
var ServiceController = require("./controllers/services.js")
var RequestController = require("./controllers/requests.js")
var OfferController = require("./controllers/offers.js")
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
//------------------------User-------------------------------
router.route("/userLogin").post(UserController.userLogin)
router.route("/registerUser").post(UserController.registerUser)
router.route("/testjwt").post(UserController.testjwt)
router.route("/userLogout").post(UserController.userLogout)
router.route("/Tokentest").post(UserController.Tokentest)
router.route("/senddata").post(UserController.sendData)
router.route("/userShow").post(UserController.show)
//-------------------------Provider-----------------------------
router.route("/registerProvider").post(ProviderController.registerProvider)
router.route("/loginProvider").post(ProviderController.providerLogin)
router.route("/logoutProvider").post(ProviderController.providerLogout)
router.route("/showProvider").post(ProviderController.show)
//------------------------Service-------------------------------
router.route("/showProviderService").post(ServiceController.show)
router.route("/showListProviceService").post(ServiceController.showList)
router.route("/addService").post(ServiceController.add)
router.route("/showService").post(ServiceController.show)
router.route("/showListService").post(ServiceController.showList)
router.route("/providerChangeStatus").post(ServiceController.providerChangeStatus)
router.route("/userRating").post(ServiceController.userRating)
//--------------------------Request--------------------------------
router.route("/userConfirmService").post(RequestController.userConfirmService)
router.route("/userShowRequest").post(RequestController.userShowRequest)
router.route("/providerShowRequest").post(RequestController.providerShowRequest)
//---------------------------Offer-----------------------------------
router.route("/userOfferRequest").post(OfferController.UserOfferRequest)
router.route("/providerCheckListOffer").post(OfferController.providerCheckListOffer)
router.route("/providerResponseOffer").post(OfferController.providerResponseOffer)
router.route("/userConfirmOffer").post(OfferController.userConfirmOffer)
router.route("/UserListShowOfferFromProvider").post(OfferController.UserListShowOfferFromProvider)
router.route("/UserShowOfferFromProvider").post(OfferController.UserShowOfferFromProvider)
router.route("/UserShowResponseFromProvider").post(OfferController.UserShowResponseFromProvider)
router.route("/providerCheckOffer").post(OfferController.providerCheckOffer)
router.route("/userShowListResponse").post(OfferController.UserShowListResponse)
/*
router.route("/").post(OfferController)
router.route("/").post(OfferController)
router.route("/").post(OfferController)
*/


app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})