var mongoose = require("mongoose")
var users = require("../models/user.js")
var express = require('express')
var bodyParser = require('body-parser')

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
    if(req.body && req.body.Username)
    {
        var user = new users(req.body);
        users.findOne({'Username' : req.body.Username},function(err,users){
            if(err){
                return res.send(err);
            }else if(!users){
                console.log(users.Username)
                console.log(req.body.Username)
                    //save ข้อมูล
                    user.save(function(err){
                        if(err){
                            console.log(err)
                            return res.send("Saved")
                        }else{
                            console.log("Saved")
                            return res.send("Saved")
                        }
                    })
            }else{
                console.log(users.Username)
                console.log(req.body.Username)
                return res.send("มีผู้ใช้อยู่แล้ว")
            }
        });
        // user.name = req.body.name;
        // user.Username = req.body.Username;
        // user.email = req.body.email;
        // user.password = req.body.password;
        console.log(user);
    }else{
        return res.send("has no data")
    }
}