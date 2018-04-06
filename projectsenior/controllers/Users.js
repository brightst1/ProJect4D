var mongoose = require("mongoose")
var users = require("../models/user.js")
var offers = require("../models/offer.js")
var express = require('express')
var bodyParser = require('body-parser')
var sha512 = require('sha512')
var regExp_name = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]+/i //name and lastName
var regExp_email = /[a-z]([a-z]|.|_|[0-9])*@[a-z]+(.[a-z]+)+/gi
var jwt = require('jsonwebtoken')
var ObjectId = mongoose.Types.ObjectId;

var checkExp = function( str, exp ){
    var str_checked = str.match(exp)
    console.log(str_checked,'str check ')
    if( str_checked && str_checked.toString() === str ) {
      return true;
    }
    else {
      return false;
    }
  }

var checkID = function(id)
{
  if(id.length != 13)
    return false;
  for(i=0, sum=0; i < 12; i++)
    sum += parseFloat(id.charAt(i))*(13-i); if((11-sum%11)%10!=parseFloat(id.charAt(12)))
  return false; return true;
}

exports.getUser = function(req,res){
    res.send("get User")
}

exports.addUser = function(req,res){
    var user = new User(req.body)
    if(req.body.username && req.body.email){
        user.find({username:req.body.username})
    }

    user.save(function(err){
        if(err){
            res.send("addUser error")
        }
        res.send("User added")
    })

}

exports.addValue = function(req,res){
    console.log("HELLO")
    // console.log(req.body)
    var user = new users(req.body);
    if(req.body && req.body.Username)
    {
        users.findOne({'Username' : req.body.Username},function(err,userss){
            if(err){
                return res.send(err);
            }else if(!userss){
                    //save ข้อมูล
                    user.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send("err")
                        }else{
                            console.log("Saved")
                            return res.send("Saved")
                        }
                    })
            }else{
                // console.log(users.Username)
                // console.log(req.body.Username)
                return res.send("มีผู้ใช้อยู่แล้ว")
            }
        });
        // user.name = req.body.name;
        // user.Username = req.body.Username;
        // user.email = req.body.email;
        // user.password = req.body.password;
        console.log(user);
    }else{
        return res.send("ไม่ข้อมูลกรุณากรอกข้อมูล")
    }
}

exports.userLogin = function(req,res){
    if(req.body && req.body.Username && req.body.password){
        users.findOne({'Username':req.body.Username},function(err,existUser){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาดบางอย่าง'})
            }else if(!existUser){
                return res.send({err:'ไม่มีชื่อผู้ใช้'})
            }else{
                if ((existUser.Username === req.body.Username) && existUser.password == sha512(req.body.password) ){
                    existUser.token = jwt.sign({password:existUser.password},'project4D')
                    console.log("User :"+existUser.Username+" logged in")
                    existUser.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send({err:'error when saving'})
                        }else{
                            
                            return res.send({token:existUser.token})
                        }
                    })
                    // console.log(req.body);
                    // var token = {}
                    // token = existUser.token
                }else{
                    return res.send({status:"wrong password"})
                }
            }
        })
    }else{
        return res.send({err:'กรุณากรอกข้อมูล'})
    }
}

exports.userLogout = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,result){
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
                        }else{
                            return res.send({status:'Logged Out'})
                        }
                    })
                }else{
                    return res.send({status:'token does not match.'})
                }
            }
        })
    }else{
        return res.send({err:'กรุณากรอกข้อมูล'})
    }
}

exports.testjwt = function(req,res){
    if(req.body && req.body.Username && req.body.password){
        return res.send({token: jwt.sign({Username: req.body.Username},'project4D')})
        
    }
}
// exports.userEdit = function(req,res){
//     if(req.body.Username && req.body){

//     }
// }

exports.registerUser = function(req,res){
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
        users.findOne({'Username':req.body.Username},function(err,existUser){
            if(err){
                console.log(err)
                return res.send(err)
            }else if(existUser){
                return res.send({err:'มีผู้ใช้บัญชีนี้แล้ว'})
            }else{
                users.findOne({'email':req.body.email},function(er,existEmail){
                    if(err){
                        console.log(er)
                        return res.send(er)
                    }else if(existEmail){
                        console.log(existEmail.email)
                        return res.send({err:'มีผู้ใช้ E-mail นี้แล้ว'})
                    }else{
                        users.findOne({'citizenId':req.body.citizenId},function(errr,existCitizenId){
                            if(errr){
                                console.log(errr)
                                return res.send(errr)
                            }else if(existCitizenId){
                                return res.send({err:'มีผู้เลขรหัสบัตรประชาชนนี้แล้ว'})
                            }else{
                                console.log("Saving")
                                var user = new users()
                                user.Username  = req.body.Username
                                user.name      = req.body.name
                                user.lastname  = req.body.lastname
                                user.email     = req.body.email
                                user.password  = sha512(req.body.password)
                                user.citizenId = req.body.citizenId
                                user.telno    = req.body.telno
                                user.save(function(errrr){
                                    if(errrr){
                                        console.log(errrr)
                                        return res.send(errrr)
                                    }else{
                                        console.log("saved")
                                        return res.send({status:'saved'})
                                    }
                                })
                                
                            }
                        })
                    }
                })
            }
        })
    }else{
        return res.send({err:'กรุณากรอกข้อมูล'});
    }
}

exports.Tokentest = function(req,res){
    if(req.body && req.body.token && req.body.Username){
        users.findOne({'Username':req.body.Username,'token':req.body.token},function(err,result){
            if(err){
                console.log(err)
                return res.send({err:'error'})
            }else if(!result){
                return res.send({status:"data doesn't match"})
            }else{
                console.log("get token")
                return res.send({status:"กูได้Tokenแล้วไอสัส"})
            }
        })
    }
}

exports.sendData = function(req,res){
    if(req.body.Username){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send(err)
            }else if(!user){
                return res.send({status:"ไม่มี user "})
            }else{
                return res.send(user)
            }
        })
    }
}

exports.show = function(req,res){
    if(req.body && req.body.Username && req.body.token){
        users.findOne({'Username':req.body.Username},function(err,user){
            if(err){
                console.log(err)
                return res.send({err:'เกิดข้อผิดพลาด'})
            }else if(!user){
                return res.send({status:'ไม่มีชื่อผู้ใช้นี้'})
            }else{
                if(req.body.token == user.token){
                    var sendObject
                    sendObject.Username = user.Username
                    sendObject.email = user.email
                    sendObject.name = user.name
                    sendObject.lastname = user.lastname
                    return res.send(sendObject)
                }
            }
        })
    }else{
        return res.send({status:'กรุณากรอกข้อมูล'})
    }
}
