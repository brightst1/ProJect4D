var mongoose = require("mongoose")
var providers = require("../models/provider.js")
var requests = require("../models/request.js")
var services = require("../models/service.js")
var users = require("../models/user.js")
var express = require('express')
var bodyParser = require('body-parser')
var sha512 = require('sha512')
var regExp_name = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]+/i //name and lastName
var regExp_email = /[a-z]([a-z]|.|_|[0-9])*@[a-z]+(.[a-z]+)+/gi
var jwt = require('jsonwebtoken')
var ObjectId = mongoose.Types.ObjectId

/*exports.matchProvider = function(req,res){
    if(req.body && req.body.providerName && req.body.token ){
        providers.findOne({'Username':req.body.providerName},function(err,provider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดความผิดพลาด'})
            }else if(!provider){
                return res.send({status:'ไม่มีชื่อผู้ให้บริการนี้'})
            }else{

            }
        })
    }else{

    }
}*/
//----------User เลือก Service จาก Provider ที่เปิดบริการรอเอาไว้--------------------
exports.userConfirmService = function(req,res){
    if(req.body && req.body.token && req.body.Username && req.body.providername && req.body.nameService){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({err:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                providers.findOne({'Username':req.body.providername},function(err,provider){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!provider){
                        return res.send({status:'ไม่มีผู้ให้บริการรายนี้'})
                    }else{
                        services.findOne({'name':req.body.nameService},function(error,service){
                            if(error){
                                console.log(err)
                                return res.send({err:'เกิดข้อผิดพลาด'})
                            }else if(!service){
                                return res.send({status:'ไม่มีบริการนี้'})
                            }else{
                                if(req.body.token == user.token){
                                    var newRequest = new requests()
                                    newRequest.Username = user.Username
                                    newRequest.providername = provider.Username
                                    newRequest.Time = new Date()
                                    newRequest.latitude = service.latitude
                                    newRequest.longitude = service.longitude
                                    newRequest.statusFlag = 1
                                    newRequest.save(function(er){
                                        if(er){
                                            console.log(er)
                                            return res.send({err:'ไม่สามารถบันทึกข้อมูลได้'})
                                        }else{
                                            console.log('Save Request')
                                            return res.send({status:'Save!'})
                                        }
                                    })
                                }else{
                                    return res.send({status:'กรุณาเข้าสู่ระบบ'})
                                }
                            }
                        })

                    }
                })
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.userShowService = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token){
                    requests.find({'Username':user.Username},function(error,request){
                        if(error){
                            console.log(error)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!request){
                            return res.send({status:'ยังไม่มีการร้องขอใดๆ'})
                        }else{
                            return res.send(request)
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู่ระบบอีกครั้ง'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.providerShowService = function(req,res){
    if(req.body && req.body.providername && req.body.token){
        providers.findOne({'Username':req.body.providername},function(err,provider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!provider){
                return res.send({status:'ไม่มีผู้ให้บริการนี้'})
            }else{
                if(provider.token == req.body.token){
                    requests.find({'Providername':req.body.providername},function(error,request){
                        if(error){
                            console.log(error)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!request){
                            return res.send({status:'ยังไม่มีบริการใดๆ'})
                        }else{
                            return res.send(request)
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู่ระบบ'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}