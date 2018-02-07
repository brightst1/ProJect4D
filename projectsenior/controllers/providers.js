var mongoose = require("mongoose")
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
    if(req && req.body && req.body.Username && req.body.password && req.body.citizenId){
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
        return res.send({err:'กรุณาใส่ข้อมูล'});
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
                if ((existProvider.Username === req.body.Username) && (existProvider.password === sha512(req.body.password))){
                    existProvider.token = jwt.sign({password:existProvider.password},'project4D')
                    existProvider.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:'error when saving'})
                        }
                    })
                    return res.send({token:existProvider.token})
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
    if(req.body && req.body.Username && req.body.password && req.body.token){
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

exports.show = function(req,res){
    if(req.body && req.body.token && req.body.Username){
        providers.findOne({'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!result){
                return res.send({status:"ไม่มีชื่อผู้ใช้"})
            }else{
                if(result.token === req.body.token){
                    services.findOne({'owner':ObjectId(result._id)},function({err,service}){
                        if(err){
                            console.log(err)
                            return res.send({err:"เกิดข้อผิดพลาด"})
                        }else if(!service){
                            return res.send({status:"ผู้ใช้ยังไม่มีบริการใดๆ"})
                        }else{
                            return res.send(service)
                        }
                    })
                }else{
                    return res.send({status:"token ไม่ตรงกันกรุณาเข้าสู่ระบบอีกครั้ง"})
                }
            }
        })
    }else{
        return res.send({stauts:"กรุณากรอกข้อมูล"})
    }
}

exports.showList = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        providers.findOne({'Username':req.body.Username},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:"เกิดข้อผิดพลาด"})
            }else if(!result){
                return res.send({status:"ไม่มีชื่อผู้ใช้"})
            }else{
                if(result.token === req.body.token){
                    services.find({'owner':ObjectId(result._id)},function(err,service){
                        if(err){
                            console.log(err)
                            return res.send({err:"เกิดข้อผิดพลาด"})
                        }else if(!service){
                            return res.send({status:"ผู้ใช้ยังไม่มีบริการใดๆ"})
                        }else{
                            return res.send(service)
                        }
                    })
                }else{
                    return res.send({status:"token ไม่ตรงกันกรุณาเข้าสู่ระบบอีกครั้ง"})
                }
            }
        })
    }else{
        return res.send({status:"กรุณากรอกข้อมูล"})
    }
}