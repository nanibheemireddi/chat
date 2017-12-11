var asyncLoop = require('node-async-loop');

module.exports = {
    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for adding friend
     */

    
    addFriend: function(req, res) {
        var requiredParams = ["userId", "mobileNo"];
        helper.validateRequiredParams(req, res, requiredParams).then(function(response) {
            models.users.findOne({ mobileNo: req.body.mobileNo, _id: { $ne: req.body.userId } }).exec(function(error, userData) {
                if (error) {
                    helper.formatResponse('', res, error);
                } else if (_.isEmpty(userData)) {
                    var error = {
                        httpstatus: "404",
                        msg: "User does not exist or User cant be friend himself."
                    };
                    helper.formatResponse('', res, error);
                } else {
                    var isGroupTemp = false;
                    if (typeof isGroup != 'undefined' && isGroup != false) {
                        isGroupTemp = true;
                    }
                    models.users.findOne({ _id: { '$eq': req.body.userId }, friends: [userData._id] }).exec(function(err, friendData) {
                        if (err) {
                            helper.formatResponse('', res, err);
                        } else if (_.isEmpty(friendData)) {
                            models.users.findOne({ _id: { '$eq': userData._id }, friends: [req.body._id] }).exec(function(err, friendData1) {
                                if (err) {
                                    helper.formatResponse('', res, err);
                                } else if (_.isEmpty(friendData1)) {
                                    models.users.update({ _id: req.body.userId }, { $push: { friends: userData._id } }).exec(function(err, data) {
                                        if (err) {
                                            helper.formatResponse('', res, err);
                                        } else {
                                            models.users.update({ _id: userData._id }, { $push: { friends: req.body.userId } }).exec(function(err, data) {
                                                if (err) {
                                                    helper.formatResponse('', res, err);
                                                } else {
                                                    var postData = {
                                                        users: [req.body.userId, userData._id],
                                                        isGroup: isGroupTemp
                                                    };
                                                    var friendSave = new models.conversation(postData);
                                                    _mongoose.save(friendSave).then(function(savedData) {
                                                        gettingUserInfo(userData._id).then(function(userInfo) {
                                                            var data = {
                                                                friendInfo: userInfo,
                                                                chatInfo: savedData
                                                            }
                                                            var response = [];
                                                            response.data = data;
                                                            helper.formatResponse(response, res, '');
                                                        }).catch(function(error) {
                                                            helper.formatResponse('', res, error);
                                                        });
                                                    }).catch(function(error) {
                                                        helper.formatResponse('', res, error);
                                                    });
                                                }
                                            });
                                        }

                                    });
                                } else {
                                    gettingUserInfo(userData._id).then(function(userInfo) {
                                        gettingChatInfo(req.body.userId, userData._id).then(function(chatInfo) {
                                            if (chatInfo == undefined) {
                                                var postData = {
                                                    users: [req.body.userId, userData._id],
                                                    isGroup: isGroupTemp
                                                };
                                                var friendSave = new models.conversation(postData);
                                                _mongoose.save(friendSave).then(function(savedData) {
                                                    chatInfo = savedData;
                                                });
                                            }
                                            var data = {
                                                friendInfo: userInfo,
                                                chatInfo: chatInfo
                                            }
                                            var response = [];
                                            response.data = data;
                                            helper.formatResponse(response, res, '');
                                        });

                                    });
                                }
                            });
                        } else {
                            gettingUserInfo(userData._id).then(function(userInfo) {
                                gettingChatInfo(req.body.userId, userData._id).then(function(chatInfo) {
                                    if (chatInfo == undefined) {
                                        var postData = {
                                            users: [req.body.userId, userData._id],
                                            isGroup: isGroupTemp
                                        };
                                        var friendSave = new models.conversation(postData);
                                        _mongoose.save(friendSave).then(function(savedData) {
                                            chatInfo = savedData;
                                        });
                                    }
                                    var data = {
                                        friendInfo: userInfo,
                                        chatInfo: chatInfo
                                    }
                                    var response = [];
                                    response.data = data;
                                    helper.formatResponse(response, res, '');
                                }).catch(function(err) {
                                    helper.formatResponse('', res, err);
                                });

                            });
                        }
                    });

                }
            });
        });
    },



    addFriendV1: function(req, res, next) {
        var requiredParams = ['userMobileNo', 'friendMobileNo'];
        helper.validateRequiredParams(req, res, requiredParams).then(function(response) {
            var body = req.body;
            models.users.find({ $and: [{ mobileNo: { '$eq': body.friendMobileNo } }, { mobileNo: { '$ne': body.userMobileNo } }] }).exec(function(err, userData) {
                if (err) {
                    console.log(err, "err0");
                    helper.formatResponse('', res, err);
                } else if (_.isEmpty(userData)) {
                    var error = {
                        httpstatus: "200",
                        msg: "User does not exist or User cant be friend himself."
                    };
                    helper.formatResponse('', res, error);
                } else {
                    var isGroupTemp = false;
                    // if (typeof body.isGroup != 'undefined' && body.isGroup == true) {
                    //     isGroupTemp = true;
                    // }
                    models.users.findOne({ mobileNo: { '$eq': body.userMobileNo }, "friends.mobileNo": body.friendMobileNo }).exec(function(err, friendData) {
                        if (err) {
                            console.log(err, "err1");
                            helper.formatResponse('', res, err);
                        } else if (_.isEmpty(friendData)) {
                            models.users.findOne({ mobileNo: { '$eq': body.userMobileNo }, "friends.mobileNo": body.friendMobileNo }).exec(function(err, friendData1) {
                                if (err) {
                                    console.log(err, "err2");
                                    helper.formatResponse('', res, err);
                                } else if (_.isEmpty(friendData1)) {
                                    var postData = {
                                        users: [{ mobileNo: body.userMobileNo }, { mobileNo: body.friendMobileNo }],
                                        isGroup: isGroupTemp
                                    };
                                    var friendSave = new models.conversation(postData);
                                    _mongoose.save(friendSave).then(function(savedData) {
                                        var friendInfo = { mobileNo: body.friendMobileNo, conversationId: savedData._id };
                                        var friendInfo1 = { mobileNo: body.userMobileNo, conversationId: savedData._id };
                                        models.users.update({ mobileNo: body.userMobileNo }, { $push: { friends: friendInfo } }).exec(function(err, data) {
                                            if (err) {
                                                helper.formatResponse('', res, err);
                                            } else {
                                                models.users.update({ mobileNo: body.friendMobileNo }, { $push: { friends: friendInfo1 } }).exec(function(err, data) {
                                                    if (err) {
                                                        helper.formatResponse('', res, err);
                                                    } else {
                                                        gettingUserInfo(body.friendMobileNo).then(function(userInfo) {
                                                            var data = {
                                                                friendInfo: userInfo,
                                                                chatInfo: savedData
                                                            }
                                                            var response = [];
                                                            response.data = data;
                                                            helper.formatResponse(response, res, '');
                                                        }).catch(function(error) {
                                                            console.log(error, "err5");
                                                            helper.formatResponse('', res, error);
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }).catch(function(error) {
                                        console.log(error, "err6");
                                        helper.formatResponse('', res, error);
                                    });
                                } else {
                                    gettingUserInfo(body.friendMobileNo).then(function(userInfo) {
                                        gettingChatInfo(body.userMobileNo, body.friendMobileNo).then(function(chatInfo) {
                                            if (_.isEmpty(chatInfo)) {
                                                var postData = {
                                                    users: [{ mobileNo: body.userMobileNo }, { mobileNo: body.friendMobileNo }],
                                                    isGroup: isGroupTemp
                                                };
                                                var friendSave = new models.conversation(postData);
                                                _mongoose.save(friendSave).then(function(savedData) {
                                                    chatInfo = savedData;
                                                    // var friendInfo = { mobileNo: body.friendMobileNo, conversationId: savedData._id };
                                                    // var friendInfo1 = { mobileNo: body.userMobileNo, conversationId: savedData._id };
                                                    // models.users.update({ mobileNo: body.userMobileNo }, { $push: { friends: friendInfo } }).exec(function(err, data) {
                                                    //     if (err) {
                                                    //         helper.formatResponse('', res, err);
                                                    //     } else {
                                                    //         models.users.update({ mobileNo: body.friendMobileNo }, { $push: { friends: friendInfo1 } }).exec(function(err, data) {
                                                    //             if (err) {
                                                    //                 helper.formatResponse('', res, err);
                                                    //             } else {
                                                                    var data = {
                                                                        friendInfo: userInfo,
                                                                        chatInfo: chatInfo
                                                                    }
                                                                    var response = [];
                                                                    response.data = data;
                                                                    helper.formatResponse(response, res, '');
                                                        //         }
                                                        //     });
                                                        // }
                                                    // });
                                                }).catch(function(error) {
                                                    console.log(error, "err7");
                                                    helper.formatResponse('', res, error);
                                                });
                                            } else {
                                                var data = {
                                                    friendInfo: userInfo,
                                                    chatInfo: chatInfo
                                                }
                                                var response = [];
                                                response.data = data;
                                                helper.formatResponse(response, res, '');
                                            }
                                        }).catch(function(error) {
                                            console.log(error, "err8");
                                            helper.formatResponse('', res, error);
                                        });
                                    }).catch(function(error) {
                                        console.log(error, "err9");
                                        helper.formatResponse('', res, error);
                                    });;
                                }
                            });
                        } else {
                            gettingUserInfo(body.friendMobileNo).then(function(userInfo) {
                                gettingChatInfo(body.userMobileNo, body.friendMobileNo).then(function(chatInfo) {
                                    if (_.isEmpty(chatInfo)) {
                                        var postData = {
                                            users: [{ mobileNo: body.userMobileNo }, { mobileNo: body.friendMobileNo }],
                                            isGroup: isGroupTemp
                                        };
                                        var friendSave = new models.conversation(postData);
                                        _mongoose.save(friendSave).then(function(savedData) {
                                            chatInfo = savedData;
                                            // var friendInfo = { mobileNo: body.friendMobileNo, conversationId: savedData._id };
                                            // var friendInfo1 = { mobileNo: body.userMobileNo, conversationId: savedData._id };
                                            // models.users.update({ mobileNo: body.userMobileNo }, { $push: { friends: friendInfo } }).exec(function(err, data) {
                                                // if (err) {
                                                //     helper.formatResponse('', res, err);
                                                // } else {
                                                //     models.users.update({ mobileNo: body.friendMobileNo }, { $push: { friends: friendInfo1 } }).exec(function(err, data) {
                                                //         if (err) {
                                                //             helper.formatResponse('', res, err);
                                                //         } else {
                                                            var data = {
                                                                friendInfo: userInfo,
                                                                chatInfo: chatInfo
                                                            }
                                                            var response = [];
                                                            response.data = data;
                                                            helper.formatResponse(response, res, '');
                                                //         }
                                                //     });
                                                // }
                                            // });
                                        }).catch(function(error) {
                                            console.log(error, "err10");
                                            helper.formatResponse('', res, error);
                                        });
                                    } else {
                                        var data = {
                                            friendInfo: userInfo,
                                            chatInfo: chatInfo
                                        }
                                        var response = [];
                                        response.data = data;
                                        helper.formatResponse(response, res, '');
                                    }
                                }).catch(function(error) {
                                    console.log(error, "err11");
                                    helper.formatResponse('', res, error);
                                });
                            }).catch(function(error) {
                                console.log(error, "err12");
                                helper.formatResponse('', res, error);
                            });;
                        }
                    });
                }
            })

        });

    },

    /*
    

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for getting message list
     */

    gettingMessages: function(req, res) {
        var chatId = req.params.id;
        var agg = [{
                $match: { _id: new mongoose.Types.ObjectId(chatId), isGroup: false }
            },
            { $unwind: "$messages" },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.senderId",
                    foreignField: "_id",
                    as: "sender"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "isGroup": 1,
                    "messages.timeOfCreation": 1,
                    "messages.message": 1,
                    "messages.sender": { $arrayElemAt: ["$sender", 0] }

                }
            },
            {
                $group: {
                    "_id": "$_id",
                    "isGroup": { $first: "$isGroup" },
                    messages: { $push: "$messages" }
                }
            },
        ];

        models.friends.aggregate(agg, function(err, data) {
            if (err) {
                helper.formatResponse('', res, err);
            } else if (_.isEmpty(data)) {
                var error = {
                    httpstatus: "404",
                    msg: "data not found"
                };
                helper.formatResponse('', res, error);
            } else {
                var response = [];
                response.data = data;
                helper.formatResponse(response, res, '');
            }
        });
    },

    /**
     * Action for creating group
     *
     * @method createGroup
     * @param {req} request
     * @param {res} response
     * @return {data} res - If data is there then it returns Bub Hub love posts otherwise it returns message.
     */

    createGroup: function(req, res) {
        var requiredParams = ['groupCreatedBy'];
        helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var body = req.body;
            if (typeof req.body.groupName == undefined || req.body.groupName == "") {
                body.groupName = 'new Group';
            }
            body.isGroup = true;
            body.users = [
                { mobileNo: req.body.groupCreatedBy, isAdmin: true }
            ]
            var groupData = new models.conversation(body);
            models.users.findOne({ mobileNo: body.groupCreatedBy }).exec(function(err, userData) {
                if (err) {
                    helper.formatResponse('', res, err)
                } else if (_.isEmpty(userData)) {
                    err = {
                        httpstatus: "200",
                        msg: "User does not exist."
                    };
                    helper.formatResponse('', res, err);
                } else {
                    _mongoose.save(groupData).then(function(data) {
                        var response = [];
                        response.data = data;
                        helper.formatResponse(response, res, '');
                    }).catch(function(error) {
                        console.log(error)
                        helper.formatResponse('', res, error);
                    });
                }
            });
        });
    },


    createGroupV1: function(req, res) {
        var requiredParams = ['groupCreatedBy', 'users'];
        helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var body = req.body;
            if (typeof req.body.groupName == undefined || req.body.groupName == "") {
                body.groupName = 'new Group';
            }
            body.isGroup = true;
            body.users = [
                { mobileNo: req.body.groupCreatedBy, isAdmin: true }
            ]
            var groupData = new models.conversation(body);
            models.users.findOne({ mobileNo: body.groupCreatedBy }).exec(function(err, userData) {
                if (err) {
                    helper.formatResponse('', res, err)
                } else if (_.isEmpty(userData)) {
                    err = {
                        httpstatus: "200",
                        msg: "User does not exist."
                    };
                    helper.formatResponse('', res, err);
                } else {
                    _mongoose.save(groupData).then(function(data) {
                        if (!_.isEmpty(users)) {
                            var rejectedData = [];
                            var sucessData = [];
                            var rejectedItem = {};
                            asyncLoop(body.users, function(item, next) {
                                if (body.groupCreatedBy != item) {
                                    models.users.findOne({ mobileNo: item }).exec(function(err, userData) {
                                        if (err || _.isEmpty(userData)) {
                                            rejectedItem.mobileNo = item;
                                            rejectedItem.msg = "user does not exist.";
                                            rejectedData.push(rejectedItem);
                                            next();
                                        } else {
                                            models.conversation.findOne({ _id: { $eq: data._id }, "users.mobileNo": item }).exec(function(err, groupdata) {
                                                if (err || !_.isEmpty(groupdata)) {
                                                    rejectedItem.mobileNo = item;
                                                    rejectedItem.msg = "user already in group.";
                                                    rejectedData.push(rejectedItem);
                                                    next();
                                                } else {
                                                    var sucessItem = {
                                                        name: userData.name,
                                                        mobileNo: userData.mobileNo
                                                    }
                                                    sucessData.push(sucessItem);
                                                    var updateParams = {
                                                        $push: { users: { mobileNo: item } }
                                                    };
                                                    models.conversation.update({ _id: body.groupId }, updateParams).then(function(data) {
                                                        next();
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    rejectedItem.mobileNo = item;
                                    rejectedItem.msg = "user cant add himself to the group.";
                                    rejectedData.push(rejectedItem);
                                    next();
                                }
                            }, function(err) {
                                if (err) {
                                    console.log(err, "err 3");
                                    helper.formatResponse('', res, err);
                                } else {
                                    var response = [];
                                    var result = {
                                        msg: "group created sucessfully.",
                                        skippedData: rejectedData
                                    }
                                    // if(!_.isEmpty(sucessData)) {
                                    //     io.on('connection', function(socket) {
                                    //         socket.broadcast.to(body.groupId).emit('added', {
                                    //             addedData: sucessData
                                    //         });
                                    //         io.to(body.groupId).emit('added', {
                                    //             addedData: sucessData
                                    //         });
                                    //     });
                                    // }
                                    response.data = result;
                                    helper.formatResponse(response, res, '');
                                }
                            });
                        }
                    }).catch(function(error) {
                        console.log(error)
                        helper.formatResponse('', res, error);
                    });
                }
            });
        });
    },

    /**
     * Action for adding friend to group
     *
     * @method addUserToGroup
     * @param {req} request
     * @param {res} response
     * @return {data} res - If data is there then it returns Bub Hub love posts otherwise it returns message.
     */

    addUserToGroup: function(req, res) {
        var requiredParams = ['adminMobileNumber', 'users', 'groupId'];
        helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var body = req.body;
            common.conversation.isGroupAdmin(body.groupId, body.adminMobileNumber).then(function(data) {
                if (_.isEmpty(data)) {
                    var error = {
                        httpstatus: "404",
                        msg: "user does not have permission to add user"
                    }
                } else if (!_.isEmpty(body.users)) {
                    var rejectedData = [];
                    var sucessData = [];
                    var rejectedItem = {};
                    asyncLoop(body.users, function(item, next) {
                        if (body.adminMobileNumber != item) {
                            models.users.findOne({ mobileNo: item }).exec(function(err, userData) {
                                if (err || _.isEmpty(userData)) {
                                    rejectedItem.mobileNo = item;
                                    rejectedItem.msg = "user does not exist.";
                                    rejectedData.push(rejectedItem);
                                    next();
                                } else {
                                    models.conversation.findOne({ _id: { $eq: body.groupId }, "users.mobileNo": item }).exec(function(err, groupdata) {
                                        if (err || !_.isEmpty(groupdata)) {
                                            rejectedItem.mobileNo = item;
                                            rejectedItem.msg = "user already in group.";
                                            rejectedData.push(rejectedItem);
                                            next();
                                        } else {
                                            var sucessItem = {
                                                userId: item.userId,
                                                name: userData.name,
                                                mobileNo: userData.mobileNo,
                                                isAdmin: false
                                            };
                                            sucessData.push(sucessItem);
                                            var updateParams = {
                                                $push: { users: { mobileNo: item } }
                                            };
                                            models.conversation.update({ _id: body.groupId }, updateParams).then(function(data) {
                                                next();
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            rejectedItem.mobileNo = item;
                            rejectedItem.msg = "user cant add himself to the group.";
                            rejectedData.push(rejectedItem);
                            next();
                        }
                    }, function(err) {
                        if (err) {
                            console.log(err, "err 3");
                            helper.formatResponse('', res, err);
                        } else {
                            var response = [];
                            var result = {
                                msg: "added sucessfully",
                                skippedData: rejectedData
                            }
                            if(!_.isEmpty(sucessData)) {
                                io.to(body.groupId).emit('added', {
                                    conversationId: body.groupId,
                                    addedData: sucessData
                                });
                            }
                            response.data = result;
                            helper.formatResponse(response, res, '');
                        }
                    });
                }
            }).catch(function(error) {
                console.log(error, "err end");
                helper.formatResponse('', res, error);
            });

        });
    },

}






/* getting userInfo */
function gettingUserInfo(userId) {
    return new Promise(function(resolve, reject, next) {
        var agg = [{
                $match: {
                    mobileNo: { '$eq': userId }
                }
            },
            {
                $project: {
                    friends: 0
                }
            }
        ];
        models.users.aggregate(agg, function(error, data) {
            if (error) {
                next();
            } else {
                resolve(data[0]);
            }
        });
    });
}


/* getting chatInfo */
function gettingChatInfo(userId, friendId) {

    return new Promise(function(resolve, reject, next) {
        var agg = [{
            $match: {
                $or: [{ users: [userId, friendId] },
                    { users: [friendId, userId] }
                ]
            }
        }];
        models.conversation.aggregate(agg, function(error, data) {
            if (error) {
                next();
            } else {
                resolve(data[0]);
            }
        });
    });
}