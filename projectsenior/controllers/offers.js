var mongoose = require("mongoose")
var providers = require("../models/provider.js")
var requests = require("../models/request.js")
var services = require("../models/service.js")
var users = require("../models/user.js")
var offers = require("../models/offer.js")
var responses = require("../models/response.js")
var requests = require("../models/request.js")
var express = require('express')
var bodyParser = require('body-parser')
var sha512 = require('sha512')
var regExp_name = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]+/i //name and lastName
var regExp_email = /[a-z]([a-z]|.|_|[0-9])*@[a-z]+(.[a-z]+)+/gi
var jwt = require('jsonwebtoken')
var lodash = require('lodash')
var ObjectId = mongoose.Types.ObjectId

exports.UserOfferRequest = function(req,res){
    if(req.body && req.body.token && req.body.Username){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:err})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token && req.body.typeservice){
                    var newOffer = new offers()
                    newOffer.typeservice = req.body.typeservice
                    newOffer.detail.type_info = req.body.type_info
                    newOffer.amount = req.body.amount
                    newOffer.detail.moreDetail = req.body.moreDetail
                    newOffer.detail.toolsCheck = req.body.toolsCheck
                    newOffer.detail.problem = req.body.problem
                    newOffer.detail.placeType = req.body.placeType
                    newOffer.status = 1
                    newOffer.Username = req.body.Username
                    newOffer.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else{
                            console.log({status:'Saved Offer'})
                            return res.send({result:"SAVE"})
                        }
                    })
                }else{
                    return res.send({status:'ไม่สามารถทำรายการได้'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณาใส่ข้อมูล'})
    }

}

exports.providerCheckListOffer = function(req,res){
    if(req.body && req.body.token && req.body.providername && req.body.typeservice){
        offers.find({'typeservice':req.body.typeservice,'status':1},function(err,offer){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
                /*
                    res.status(500).send({
                        status: 500,
                        reason:'เกิดข้อผิดพลาด',
                        result: null
                });
                */
            }else if(!offer){
                return res.send({status:'ยังไม่รายที่ค้นหาในตอนนี้'})
            }else{
                //return res.send(offer)
                var offerSend = []
                offer.forEach(function(data){
                    var objectSend = {}
                    for(var y in data){
                        if(y.toString() !== 'detail'){
                            //objectSend[y] = data[y]
                        }else{
                            for(var x in data.detail){
                                //objectSend[x] = data[x]
                                objectSend[x] = data.detail[x]
                                objectSend._id = data._id
                                objectSend.Username = data.Username
                                objectSend.typeservice = data.typeservice
                                objectSend.status = data.status
                            }
                        }
                    }
                    //console.log(objectSend)
                    offerSend.push(objectSend)
                })
                //console.log(offerSend)
                return res.send({
                    status:200,
                    reason:"ok",
                    result:offerSend
                })
            }
        })
    }else{
        return res.send({status:'ข้อมูลไม่ครบกรุณากรอกข้อมูล'})
    }
}

exports.providerCheckOffer = function(req,res){
    if(req.body && req.body.token && req.body.providername && req.body.typeservice && req.body.offerId){
        providers.findOne({'Username':req.body.providername},function(err,provider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!provider){
                return res.send({status:'ไม่พบข้อมูล'})
            }else{
                if(provider.token == req.body.token){
                    offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!offer){
                            return res.send({status:'ยังไม่รายที่ค้นหาในตอนนี้'})
                        }else{
                            return res.send({
                                status : 200,
                                reason : "ok",
                                result : offer
                            })
                        }
                    })
                }
            }
        })
    }else{
        return res.send({status:'ข้อมูลไม่ครบกรุณากรอกข้อมูล'})
    }
}

exports.providerResponseOffer = function(req,res){
    if(req.body && req.body.providername && req.body.token && req.body.offerId){
        offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!offer){
                return res.send({status:'ไม่พบข้อมการร้องขอ'})
            }else{
                providers.findOne({'token':req.body.token,'Username':req.body.providername},function(err,provider){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!provider){
                        return res.send({status:'ข้อมูลของท่านไม่ตรงกัน'})
                    }else{
                        responses.findOne({'providername':req.body.providername,'offerId':ObjectId(offer._id)},function(err,response){
                            if(err){
                                console.log(err)
                                return res.send({err:'เกิดข้อผิดพลาด'})
                            }else if(!response){
                                var newResponse = new responses()
                                newResponse.offerId = offer._id
                                newResponse.providername = req.body.providername
                                newResponse.Username = offer.Username
                                newResponse.save(function(err){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'เกิดข้อผิดพลาดในการบันทึกข้อมูล'})
                                    }else{
                                        console.log("SAVED OFFER FOR PROVIDER")
                                        return res.send({status:'save'})
                                    }
                                })
                            }else{
                                return res.send({status:"ท่านได้ตอบรับไปแล้ว"})
                            }
                        })
                    }
                })
            }
        })
    }else{
        return res.send({status:'ข้อมไม่ครบกรุณากรอกข้อมูล'})
    }
}

exports.userConfirmOffer = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.offerId && req.body.latitude && req.body.longitude){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
            }else if(!user){
                console.log('Have No User')
            }else{
                if(user.token == req.body.token){
                     offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:"เกิดข้อผิดพลาด"})
                        }else if(!offer){
                            return res.send({status:'ไม่พบการร้องขอ'})
                        }else{
                            responses.findOne({'offerId':ObjectId(req.body.offerId),'Username':req.body.Username},function(err,response){
                                if(err){
                                    console.log(err)
                                    return res.send({err:'เกิดข้อผิดพลาด'})
                                }else if(!response){
                                    return res.send('ไม่พบการตอบรับของผู้ให้บริการ')
                                }else{
                                    if(offer.response_id){
                                        return res.send({status:'ท่าได้ผูกข้อเสนอกับผู้ให้บริการอื่นแล้ว'})
                                    }else{
                                        offer.response_id = response._id
                                        var newRequest = new requests()
                                        newRequest.Username = req.body.Username
                                        newRequest.Providername = response.providername
                                        newRequest.offerId = offer._id
                                        newRequest.Time = new Date()
                                        newRequest.latitude = req.body.latitude
                                        newRequest.longitude = req.body.longitude
                                        newRequest.statusFlag = 1
                                        newRequest.typeservice = offer.typeservice
                                        newRequest.save(function(err){
                                            if(err){
                                                console.log(err)
                                            }else{
                                                offer.save(function(err){
                                                    if(err){
                                                        console.log(err)
                                                    }else{
                                                        return res.send({status:'save request'})
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                     })
                }else{
                    return res.send({status:'ไม่สามารถดำเนินการได้'})
                }
            }
        })
    }
}

exports.UserListShowOfferFromProvider = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ชื่อผู้ใช้ไม่มีในระบบ'})
            }else{
                if(user.token == req.body.token){
                    offers.find({'Username':req.body.Username},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!offer){
                            return res.send({status:'ยังไม่มีการร้องขอรับบริการในขณะนี้'})
                        }else{
                            var offerSend = []
                            offer.forEach(function(data){
                                var objectSend = {}
                                for(var y in data){
                                    if(y.toString() !== 'detail'){
                                        //objectSend[y] = data[y]
                                    }else{
                                        for(var x in data.detail){
                                            //objectSend[x] = data[x]
                                            objectSend[x] = data.detail[x]
                                            objectSend._id = data._id
                                            objectSend.Username = data.Username
                                            objectSend.typeservice = data.typeservice
                                            objectSend.status = data.status
                                        }
                                    }
                                }
                                //console.log(objectSend)
                                offerSend.push(objectSend)
                            })
                            //console.log(offerSend)
                            return res.send({
                                status: 200,
                                reason: "ok",
                                result: offerSend
                            })
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.UserShowOfferFromProvider = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.typeservice && req.body.offerId){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ชื่อผู้ใช้ไม่มีในระบบ'})
            }else{
                if(user.token == req.body.token){
                    offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!offer){
                            return res.send({status:'ยังไม่มีการร้องขอรับบริการในขณะนี้'})
                        }else{
                            return res.send({
                                status:200,
                                reason:"ok",
                                result:offer
                            })
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.UserShowResponseFromProvider = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.offerId){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่พบชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token){
                    offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!offer){
                            return res.send({status:'ไม่พบการเสนอข้อมูล'})
                        }else{
                            console.log(offer._id)
                            responses.find({'offerId':ObjectId(offer._id)},function(err,response){
                                if(err){
                                    console.log(err)
                                    return res.send({err:'เกิดข้อผิดพลาด'})
                                }else if(!response || lodash.isEmpty(response)){
                                    return res.send({status:'ไม่พบการตอบรับของผู้ให้บริการ'})
                                }else{
                                    return res.send({
                                        status:200,
                                        reason:"ok",
                                        result:response
                                    })
                                }
                            })
                        }
                    })
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.UserShowListResponse = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาดของระบบ'})
            }else if(!user){
                return res.send({status:'ไม่พบชื่อผู้ใช้นี้'})
            }else{
                if(req.body.token == user.token){
                    offers.findOne({'Username':req.body.Username},function(err,offer){
                        if(err){

                        }else if(!offer){

                        }else{
                            responses.find({'Username':offer.Username},function(err,response){
                                if(err){
                                    console.log(err)
                                    return res.send({err:'เกิดข้อผิดพลาด'})
                                }else if(!response){
                                    return res.send({status:'ยังไม่พบการยอมรับจากผู้บริการในตอนนี้'})
                                }else{
                                    return res.send({
                                        status:200,
                                        reason:"ok",
                                        result:response
                                    })
                                }
                            })
                        }
                    })
                }else{
                    return res.send({status:'ท่านไม่ได้เข้าสู่ระบบ'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}