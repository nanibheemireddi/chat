
var clientInfo = {};
var userInfo = {};
var groupInfo = {};
var count = 0;
var friends = {};


//for current users in the socket
function sendCurrentUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];

    if (typeof info === 'undefined') {
        return;
    }
    Object.keys(clientInfo).forEach(function(socketId) {
        var userInfo = clientInfo[socketId];

        if (info.room === userInfo.room) {
            users.push(userInfo.name);
        }
    });
    socket.emit('message', {
        name: "System",
        text: "current users: " + users.join(', '),
        timestamp: moment().valueOf()
    });
}

io.on('connection', function(socket) {
    console.log('user connected via socket.io!', socket.id);
    // io.sockets.sockets.forEach(function(s) {
    //  s.disconnect(true);
    //  console.log("disconnect");
    // });
    // console.log(clientInfo);
    socket.on('disconnect', function() {
        var userData = clientInfo[socket.id];
        console.log("disconnect", userData);
        if (typeof userData !== 'undefined') {
            var updateParams = {
                isActive: false,
                lastSeen: new Date()
            };
            _mongoose.update(models.users, { mobileNo: userData.mobileNo }, updateParams);
            if(!_.isEmpty(friends[userData.mobileNo])) {
                friends[userData.mobileNo].forEach(function(obj) {
                    io.to(obj.mobileNo).emit('userOnlineStatus', {mobileNo: userData.mobileNo, isActive: false, lastSeen: new Date()});    
                });
            }
            socket.leave(userData.mobileNo);
            io.to(userData.mobileNo).emit('notification', {
                name: 'System',
                text: userData.name + ' has left!!',
                timestamp: new Date()
            });
            delete clientInfo[socket.id];
            delete userInfo[userData.mobileNo];
            delete friends[userData.mobileNo];
        }

    });

    socket.on('createRoom', function(req) {
        console.log(req, "req");
        clientInfo[socket.id] = req;
        socket.join(req.mobileNo);
        var updateParams = {
            isActive: true
        };
        userInfo[req.mobileNo] = true;
        common.conversation.userGroups(req.mobileNo).then(function(groupData) {
            groupData.forEach(function(obj) {
                socket.join(obj.conversationId);
                groupInfo[obj.conversationId] = groupData.users;               
            });
            _mongoose.update(models.users, { mobileNo: req.mobileNo }, updateParams).then(function(data) {
                models.users.findOne({mobileNo: req.mobileNo}).exec(function(err, friendInfo) {
                    if(!_.isEmpty(friendInfo.friends)) {
                        friends[req.mobileNo] = friendInfo.friends;
                        friendInfo.friends.forEach(function(obj) {
                            io.to(obj.mobileNo).emit('userOnlineStatus', {mobileNo: req.mobileNo, isActive: userInfo[req.mobileNo], lastSeen: friendInfo.lastSeen});    
                        });
                    }
                    socket.broadcast.to(req.mobileNo).emit('notification', {
                        timestamp: new Date()
                    });
                });
            });
        });
    });

    socket.on('message', function(message,fn) {
        console.log(clientInfo, "userData list");
        // console.log(message, "message");
        if (message.text === '@currentUsers') {
            sendCurrentUsers(socket);
        } else {
            var messageData = {
                senderMobileNo: message.senderMobileNo,
                message: message.text
            };
            models.conversation.update({ _id: message.chatId }, { $push: { messages: messageData } }).exec(function(err) {
                if(err) {
                    helper.formatResponse('',res, err);
                } else {
                    message.timestamp = new Date();
                    if(message.isGroup == true) {
                        io.to(message.chatId).emit('message', message);
                    } else {
                        // console.log(clientInfo[socket.id].mobileNo, "user mobileNo");
                        // io.to(clientInfo[socket.id].mobileNo).emit('message', message);    
                        if(typeof fn != "undefined") {
                            fn(message);    
                        }
                        io.to(message.mobileNo).emit('message', message);
                    }
                    
                    if(userInfo[message.mobileNo] != true) {
                        models.tempConversations.findOne({userMobileNo: message.mobileNo}).exec(function(err, tempData) {
                            if(err) {
                                helper.formatResponse('', res, err);
                            } else if(_.isEmpty(tempData)){
                                var tempConversationData = {
                                    userMobileNo: message.mobileNo,
                                    chatId: message.chatId, 
                                    messages: [{
                                        senderMobileNo: message.senderMobileNo,
                                        message: message.text
                                    }] 
                                };
                                var tempConversation = new models.tempConversations(tempConversationData);        
                                _mongoose.save(tempConversation).then(function() {

                                }).catch(function(error) {
                                    helper.formatResponse('',res, error);
                                })
                            } else {
                                var tempMessageData = {
                                    senderMobileNo: message.senderMobileNo,
                                    message: message.text
                                };
                                models.tempConversations.update({ userMobileNo: message.mobileNo }, { $push: { messages: tempMessageData } }).exec(function(err) {
                                    if(err) {
                                        helper.formatResponse('',res, err);
                                    }
                                });         
                            }
                        });
                    }
                }
            });
        }
    });

    socket.on('userOnlineStatus', function(req, fn) {
        models.users.findOne({mobileNo: req.mobileNo}).exec(function(err, data) {
            if(!err || !_.isEmpty(data)) {
                if(userInfo[req.mobileNo] == true) {
                    fn({isActive: true});
                } else {
                    fn({isActive: false, lastSeen: data.lastSeen});
                }
            }
        });
    });

    socket.emit('notification', {
        name: "System",
        text: 'Welcome to the chatting',
        timestamp: moment().valueOf()
    });

    socket.on('like', function(req) {
        // console.log(like, "like");
        count = count + req.like;
        // console.log(count);
        io.to(clientInfo[socket.id].room).emit('like', {
            like: count
        });
    });

});