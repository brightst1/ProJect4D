var mongoose = require("mongoose")
var users = require("../models/user.js")
var providers = require("../models/provider.js")
var services = require("../models/service.js")
var express = require('express')
var bodyParser = require('body-parser')
var sha512 = require('sha512')
var regExp_name = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]+/i //name and lastName
var regExp_email = /[a-z]([a-z]|.|_|[0-9])*@[a-z]+(.[a-z]+)+/gi
var jwt = require('jsonwebtoken')
var ObjectId = mongoose.Types.ObjectId

var checkID = function(id)
{
  if(id.length != 13)
    return false;
  for(i=0, sum=0; i < 12; i++)
    sum += parseFloat(id.charAt(i))*(13-i); if((11-sum%11)%10!=parseFloat(id.charAt(12)))
  return false; return true;
}

// exports.addService = function(req,res){
//     if(req.body && req.body.token){
//         providers.findOne({'token':req.body.token},function(err,result){
//             if(err){
//                 console.log(err)
//                 return res.send({err:'เกิดข้อผิดพลาด'})
//             }else if(!token){
//                 return res.send({err:'ท่านไม่มี token กรุณา login'})
//             }else{
                
//             }
//         })
//     }

// }

exports.registerProvider = function(req,res){
    if(req.body && req.body.Username && req.body.password && req.body.citizenId && checkID(req.body.citizenId)){
        if(!req.body.name || !req.body.lastname){
            return res.send({err:'กรุณาใส่ชื่อและนามสกุล'})
        }
        if(!req.body.email){
            return res.send({err:'กรุณาใส่ E-mail'})
        }
        if(!req.body.citizenId){
            return res.send({err:'กรุณาใส่เลขรหัสบัตรประชาชน'})
        }
        providers.findOne({'Username':req.body.Username},function(err,existProvider){
            if(err){
                console.log(err)
                return res.send(err)
            }else if(existProvider){
                return res.send({err:'มีผู้ใช้บัญชีนี้แล้ว'})
            }else{
                providers.findOne({'email':req.body.email},function(er,existEmail){
                    if(err){
                        console.log(er)
                        return res.send(er)
                    }else if(existEmail){
                        console.log(existEmail.email)
                        return res.send({err:'มีผู้ใช้ E-mail นี้แล้ว'})
                    }else{
                        providers.findOne({'citizenId':req.body.citizenId},function(errr,existCitizenId){
                            if(errr){
                                console.log(errr)
                                return res.send(errr)
                            }else if(existCitizenId){
                                return res.send({err:'มีผู้เลขรหัสบัตรประชาชนนี้แล้ว'})
                            }else{
                                console.log("Saving")
                                var provider = new providers()
                                provider.Username  = req.body.Username
                                provider.name      = req.body.name
                                provider.lastname  = req.body.lastname
                                provider.email     = req.body.email
                                provider.password  = sha512(req.body.password)
                                provider.citizenId = req.body.citizenId
                                provider.Telno     = req.body.telno
                                provider.typeservice = req.body.typeservice
                                provider.detail = req.body.detail
                                provider.save(function(errrr){
                                    if(errrr){
                                        console.log(errrr)
                                        return res.send(errrr)
                                    }
                                })
                                console.log("saved")
                                return res.send({status:'saved'})
                            }
                        })
                    }
                })
            }
        })
    }else{
        return res.send({err:'กรุณาตรวจสอบข้อมูลและรหัสประชาชน'});
    }
}

exports.providerLogin = function(req,res){
    if(req.body && req.body.Username && req.body.password){
        providers.findOne({'Username':req.body.Username},function(err,existProvider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาดบางอย่าง'})
            }else if(!existProvider){
                return res.send({err:'ไม่มีชื่อผู้ใช้'})
            }else{
                if ((existProvider.Username === req.body.Username) && (existProvider.password == sha512(req.body.password))){
                    existProvider.token = jwt.sign({password:existProvider.password},'project4D')
                    existProvider.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:'error when saving'})
                        }
                    })
                    console.log("Provider : "+existProvider.Username+" Logged In")
                    return res.send({token:existProvider.token,typeservice:existProvider.typeservice})
                }else{
                    return res.send({err:'รหัสผิดพลาด'})
                }
            }
        })
    }else{
        return res.send({err:'กรุณากรอกข้มูล'})
    }
}

exports.providerLogout = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        providers.findOne({'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({err:'err'})
            }else{
                if(req.body.token === result.token){
                    result.token = ""
                    result.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:'something error'})
                        }
                    })
                    console.log("provider: "+result.Username+" logged out")
                    return res.send({status:'Logged Out'})
                }else{
                    return res.send({status:'token does not match.'})
                }
            }
        })
    }else{
        return res.send({err:'ข้อมมูลไม่ครบถ้วน'})
    }
}

exports.edit = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        providers.findOne({'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดปัญหาบางอย่าง'})
            }else if(!result){
                return res.send({status:"ไม่พบผู้ใช้"})
            }else{
                if(req.body.token == result.token){
                    for(var keys in req.body){
                        console.log(req.body[keys])
                        if(keys !== "_id" && keys !== "__v" && keys !=="Username" && keys !== "token" ){
                            if(req.body[keys] != ""){
                                //console.log(keys)
                                result[keys] = req.body[keys]
                            }
                        }
                    }
                    result.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:"ไม่สามารถบันทึกข้อมูลได้"})
                        }else{
                            return res.send({status:"บันทึกข้อมูลสำเร็จ"})
                        }
                    })
                }else{
                    return res.send({status:'กรุณาเข้าสู่ระบบ'})
                }
            }
        })
    }else{
        return res.send({status:"กรุณากรอกข้อมูล"})
    }
}

exports.show = function(req,res){
    if(req.body && req.body.token && req.body.Username){
        providers.findOne({'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:"ไม่มีชื่อผู้ใช้"})
            }else{
                var owner = {}
                owner.name = result.name
                owner.lastname = result.lastname
                owner.citizenId = result.citizenId
                owner.email = result.email
                owner.typeservice = result.typeservice
                owner.Telno = result.Telno
                owner.detail = result.detail
                return res.send(owner)
            }
        })
    }else{
        return res.send({stauts:"กรุณากรอกข้อมูล"})
    }
}

exports.showUser = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.providername){
        providers.findOne({'Username':req.body.providername},function(err,provider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!provider){
                return res.send({status:'ไม่มีชื่อผู้ให้บริการ'})
            }else{
                if(provider.token == req.body.token){
                    users.findOne({'Username':req.body.Username},function(err,user){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!user){
                            return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
                        }else{
                            var sendObject = {}
                            sendObject.Username = user.Username
                            sendObject.email = user.email
                            sendObject.name = user.name
                            sendObject.lastname = user.lastname
                            sendObject.Telno = user.Telno
                            return res.send(sendObject)
                        }
                    })
                }else{
                    return res.send({status:"กรุณาเข้าสู่ระบบ"})
                }
            }
        })
    }
}

exports.forgetPassword = function(req,res){
    if(req.body && req.body.Username && req.body.citizenId && req.body.password && req.body.repassword ){
        providers.findOne({'Username':req.body.Username},function(err,provider){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!provider){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(req.body.citizenId == provider.citizenId && (checkID(req.body.citizenId))){
                    if(req.body.password == req.body.repassword){
                        provider.password = sha512(req.body.password)
                        provider.save(function(err){
                            if(err){
                                console.log(err)
                                return res.send({err:'ไม่สามารถบันทึกรหัสได้'})
                            }else{
                                return res.send({status:'เปลี่ยนรหัสผ่านแล้ว'})
                            }
                        })
                    }else{
                        return res.send({status:'รหัสผ่านไม่ตรงกันกรุณากรอกให้ตรงกัน'})
                    }
                }else{
                    return res.send({status:'รหัสประชาชนไม่ตรงกันกรุณากรอกให้ถูกต้อง'})
                }
            }
        })
    }else{
        return res.send({status:'กรุณาตรวจสอบข้อมูลและรหัสประชาชน'})
    }
}

exports.rating = function(req,res){
    if(req.body && req.body.Username && req.body.token && req.body.providername && req.body.point){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'กรุณากรอกข้อมูล'})
            }else{
                if(user.token == req.body.token){
                    providers.findOne({'Username':req.body.providername},function(err,provider){
                        if(err){
                            console.log(err)
                            return res.send({err:'เกิดข้อผิดพลาด'})
                        }else if(!provider){
                            return res.send({status:'ไม่พบผู้ให้บริการ'})
                        }else{
                            if(provider.time == 0){
                                provider.rate = req.body.point
                                provider.save(function(err){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'ไม่สามารถบันทึกได้'})
                                    }else{
                                        console.log("saved")
                                        provider.time += 1
                                        return res.send({status:'add rating complete'})
                                    }
                                })
                            }else{
                                provider.rate = (provider.rate+req.body.point)/provider.time
                                provider.save(function(err){
                                    if(err){
                                        console.log(err)
                                        return res.send({err:'ไม่สามารถบันทึกได้'})
                                    }else{
                                        console.log("saved")
                                        provider.time += 1
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