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
                if(user.token == req.body.token && req.body.typeservice && req.body.detailservice){
                    var newOffer = new offers()
                    newOffer.typeservice = req.body.typeservice
                    newOffer.detail.type_info = req.body.type_info
                    newOffer.detail.amount = req.body.amount
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

exports.providerCheckOffer = function(req,res){
    if(req.body && req.body.token && req.body.providername && req.body.typeservice){
        offers.findOne({'typeservice':req.body.typeservice},function(err,offer){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!offer){
                return res.send({status:'ยังไม่รายที่ค้นหาในตอนนี้'})
            }else{
                return res.send(offer)
            }
        })
    }else{
        return res.send({status:'ข้อมูลไม่ครบกรุณากรอกข้อมูล'})
    }
}

exports.providerResponseOffer = function(req,res){
    if(req.body && req.body.providername && req.body.token && req.body.Username){
        offers.findOne({'Username':req.body.Username},function(err,offer){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!offer){
                return res.send({status:'ไม่พบข้อมการร้องขอ'})
            }else{
                users.findOne({'token':req.body.token,'Username':req.body.Username},function(err,user){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!user){
                        return res.send({status:'ข้อมูลของท่านไม่ตรงกัน'})
                    }else{
                        var newResponse = new response()
                        newResponse.offerId = offer._id
                        newResponse.providername = req.body.providername
                        newResponse.save(function(err){
                            if(err){
                                console.log(err)
                                return res.send({err:'เกิดข้อผิดพลาดในการบันทึกข้อมูล'})
                            }else{
                                console.log("SAVED OFFER FOR PROVIDER")
                                return res.send({status:'SAVED'})
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
    if(req.body && req.body.offerId && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token){
                    offers.findOne({'_id':ObjectId(req.body.offerId)},function(err,offer){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!offer){
                            return res.send({status:'ยังไม่มีการร้องขอบริการ'})
                        }else{
                            if(offer.response_id){
                                responses.findOne({'_id':ObjectId(offer.response_id)},function(err,response){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'เกิดข้อผิดพลาด'})
                                    }else if(!response){
                                        return res.send({status:'ยังไม่มีผู้ให้บริการเสนอการให้บริการในตอนนี้'})
                                    }else{
                                        var newRequest = new requests()
                                        newRequest.Username = user.Username
                                        newRequest.providername = provider.Username
                                        newRequest.Time = new Date()
                                        newRequest.latitude = service.latitude
                                        newRequest.longitude = service.longitude
                                        newRequest.statusFlag = 1
                                        newRequest.save(function(err){
                                            if(er){
                                                console.log(err)
                                                return res.send({err:'ไม่สามารถบันทึกข้อมูลได้'})
                                            }else{
                                                console.log('Save Request')
                                                return res.send({status:'Save!'})
                                            }
                                        })
                                    }
                                })
                            }else{
                                return res.send({status:'ท่านได้เลือกบริการจากผู้ให้บริการท่านอื่นไปแล้ว'})
                            }
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้า'})
                }
            }
        })
    }else{
        return res.send({status:'ข้อมูลไม่ครบกรุณากรอกข้อมูล'})
    }

}

exports.UserListShowOfferFromProvider = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.typeservice){
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
                            return res.send(offer)
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
                            return res.send(offer)
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
