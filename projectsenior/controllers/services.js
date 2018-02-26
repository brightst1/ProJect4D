var mongoose = require("mongoose")
var services = require("../models/service.js")
var providers = require("../models/provider.js")
var users = require("../models/user.js")
var express = require('express')
var bodyParser = require('body-parser')
var sha512 = require('sha512')
var regExp_name = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]+/i //name and lastName
var regExp_email = /[a-z]([a-z]|.|_|[0-9])*@[a-z]+(.[a-z]+)+/gi
var jwt = require('jsonwebtoken')
var ObjectId = mongoose.Types.ObjectId

exports.add = function(req,res){
    if(req.body && req.body.token && req.body.Username && req.body.name){
        providers.findOne({'token':req.body.token,'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:'คุณไม่มีสิทธิ์เข้าถึงกรุณาเข้าสู่ระบบ'})
            }else{
                services.findOne({'name':req.body.name},function(err,Service){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(Service){
                        return res.send({status:'มีคนใช้ชื่อบริการนี้แล้ว'})
                    }else{
                        var newService = new services(req.body)
                        newService.owner = ObjectId(result._id)
                        newService.save(function(err){
                            if(err){
                                console.log(err)
                                return res.send({err:'ไม่สามารถบันทึกข้อมูลได้'})
                            }else{
                                console.log('saved')
                                return res.send({status:'Saved'})
                            }
                        })
                    }
                })
            }
        })
    }else{
        return res.send({err:'กรุณากรอกข้อมูล'})
    }
}

exports.edit = function(req,res){
    if(req.body && req.body.token && req.body.Username && req.body.name){
        providers.findOne({'Username':req.body.Username,'token':req.body.token},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:'คุณไม่มีสิทธิ์ในการเข้าถึงระบบ'})
            }else{
                services.findOne({'owner':result._id,'name':req.body.name},function(err,service){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!service){
                        return res.send({status:'ไม่มีชื่อบริการนี้กรุณากรอกอีกครั้ง'})
                    }else{
                        for(var keys in req.body){
                            if(keys != "_id"){
                                service[keys] = req.body[keys]
                            }
                        }
                        service.save(function(err){
                            if(err){
                                console.log(err)
                                return res.send({err:'ไม่สามารถบันทึกข้อมูลได้'})
                            }else{
                                return res.send({ status : 'saved' ,notification:"แก้ไขข้อมูลร้านค้า "+service.name+" สำเร็จ"})
                            }
                        })
                    }
                })
            }
        })
    }else{
        return res.send("ไม่มีข้อมูลกรุณากรอกข้อมูล")
    }
}

exports.show = function(req,res){
    if(req.body && req.body.token && req.body.Username && req.body.name){
        providers.findOne({'Username':req.body.Username,'token':req.body.token},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:'ไม่สามารถทำรายการได้'})
            }else{
                services.findOne({'owner':result._id,'name':req.body.name},function(err,service){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!service){
                        return res.send({status:'ไม่มีบริการนี้'})
                    }else{
                        return res.send(service)
                    }
                })
            }
        })
    }else{
        return res.send("ไม่มีข้อมูลกรุณากรอกข้อมูล")
    }
}

exports.showList = function(req,res){
    if(req.body && req.body.token && req.body.Username){
        providers.findOne({'Username':req.body.Username,'token':req.body.token},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:'ไม่สามารถทำรายการได้'})
            }else{
                services.find({'owner':result._id},function(err,service){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else if(!service){
                        return res.send({status:'ไม่มีบริการนี้'})
                    }else{
                        return res.send(service)
                    }
                })
            }
        })
    }else{
        return res.send("ไม่มีข้อมูลกรุณากรอกข้อมูล")
    }
}

exports.userShowService = function(req,res){
    if(req.body && req.body.typeService && req.body.token && req.body.Username){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token){
                    services.find({'typeService':req.body.typeService},function(err,service){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!service){
                            return res.send({status:'ยังไม่มีบริการในกลุ่มนี้'})
                        }else{
                            return res.send(service)
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู้ระบบ'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.providerChangeStatus = function(req,res){
    if(req.body && req.body.providername && req.body.token && req.body.status){
        services.findOne({'Username':req.body.providername},function(err,service){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!service){
                return res.send({status:'ไม่ชื่อผู้ใช้นี้'})
            }else{
                service.status = req.body.status
                service.save(function(err){
                    if(err){
                        console.log(err)
                        return res.send({err:'เกิดข้อผิดพลาด'})
                    }else{
                        console.log('Change status')
                        return res.send({status:'save'})
                    }
                })
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}

exports.userRating = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.serviceName && req.body.point){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(user.token == req.body.token){
                    services.findOne({'name':req.body.serviceName},function(err,service){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!service){
                            return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
                        }else{
                            var temp = service.rating
                            temp += req.body.point
                            if(service.rateTime == 0){
                                service.rating = req.body.point
                                service.save(function(err){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'ไม่สามารถบันทึกได้'})
                                    }else{
                                        console.log("saved")
                                        service.rateTime += 1
                                        return res.send({status:'add rating complete'})
                                    }
                                })
                            }else{
                                service.rating = temp/service.rateTime
                                service.save(function(err){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'ไม่สามารถบันทึกได้'})
                                    }else{
                                        console.log("saved")
                                        service.rateTime += 1
                                        return res.send({status:'add rating complete'})
                                    }
                                })
                            }
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