var jwt = require('jsonwebtoken');
var bcrypt = require("bcrypt-nodejs");
var multiparty = require('multiparty');
var fs = require('fs');

module.exports = {
    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for user registration
     */

    userLogin: function(req, res) {
        var requiredParams = ['mobileNo', 'password']; /* required params */
        helper.validateRequiredParams(req, res, requiredParams).then(function(response) {
            var postData = req.body;
            var condition = { mobileNo: req.body.mobileNo };
            models.users.findOne(condition).exec(function(err, data) {
                if (err) {
                    helper.formatResponse('', res, error);
                } else if (_.isEmpty(data)) {
                    err = {
                        httpstatus: "200",
                        msg: "user does not exist. so would you register first."
                    }
                    helper.formatResponse('', res, err); 
                } else if(typeof data.password != "undefined") {
                    var result = bcrypt.compareSync(req.body.password, data.password);
                    if(result == true) {
                        /* token generation */
                        var token = jwt.sign(data, process.env.JWT_SECRET_KEY);
                        res.setHeader('x-access-token', token);
                        common.users.userDetails(req.body.mobileNo).then(function(userData) {
                            common.conversation.userGroups(req.body.mobileNo).then(function(groupData) {
                                var response = {};
                                userData.groups = groupData;
                                response.data = userData;
                                helper.formatResponse(response, res, '');
                            }).catch(function(error) {
                                helper.formatResponse('', res, error);
                            });
                        }).catch(function(error) {
                            helper.formatResponse('', res, error);
                        });
                    } else {
                        err = {
                            httpstatus: "400",
                            msg: "password is incorect."
                        }
                        helper.formatResponse('', res, err);
                    }
                }
            });

        });
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for getting user list
     */
    // getUsers: function(req, res) {
    //     var mobileNo = req.params.mobileNo;
    //     var agg = [
    //         { $match: { mobileNo: mobileNo } }
    //     ];
    //     models.users.aggregate(agg, function(err, data) {
    //         if (err) {
    //             helper.formatResponse('', res, err);
    //         } else if (_.isEmpty(data)) {
    //             var error = {
    //                 httpstatus: "404",
    //                 msg: "data not found"
    //             };
    //             helper.formatResponse('', res, error);
    //         } else {
    //             var response = [];
    //             response.data = data[0];
    //             helper.formatResponse(response, res, '');
    //         }
    //     });
    // },


    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for getting user list
     */
    getFriends: function(req, res) {
        // var agg = [{ $match: { isDelete: false } }];
        // console.log(agg);
        models.users.aggregate([{ $match: { isDelete: false } }], function(err, data) {
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
     * Action for user registration
     * 
     * @method registration
     * @param {req} request
     * @param {res} response
     * @return {status} res -If it returns error then the status is false otherwise true. 
     */
    
    userRegistration: function(req, res) {
        var requiredParams = ['name', 'mobileNo', 'password'];
        helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var postData = req.body;
            postData.password = bcrypt.hashSync(req.body.password);
            var userSave = new models.users(postData);
            _mongoose.save(userSave).then(function(data) {
                var response = [];
                var userData = data.toJSON();
                delete userData.password;
                response.data = userData; 
                helper.formatResponse(response, res, '');
            }).catch(function(error) {
                helper.formatResponse('', res, error);
            })
        });
    },

    /**
     * Action for user registration
     * 
     * @method registration
     * @param {req} request
     * @param {res} response
     * @return {status} res -If it returns error then the status is false otherwise true. 
    */
    userRegistrationV1: function(req, res) {
        // var requiredParams = ['name', 'mobileNo', 'password', 'profilePic'];
        // helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var form = new multiparty.Form();
            form.parse(req, function(err, fields, files) {
                if(err) {
                    err = {
                        httpstatus: 400,
                        msg: 'Unable to save 0'
                    };
                    helper.formatResponse('', res, err);
                } else {
                    var newPath = __dirname + '/../../public/' + files.profilePic[0].originalFilename;
                    fs.rename(files.profilePic[0].path, newPath, function(err) {
                        if(err) {
                            err = {
                                httpstatus: 400,
                                msg: 'Unable to save 1'
                            };
                            helper.formatResponse('', res, err);
                        } else {
                            var postData = {
                                name: fields.name[0],
                                mobileNo: fields.mobileNo[0],
                                profilePic: {
                                    name: files.profilePic[0].originalFilename,
                                    filePath: "192.168.11.221/chat/public/"
                                }
                            };
                            postData.password = bcrypt.hashSync(fields.password[0]);
                            var userSave = new models.users(postData);
                            _mongoose.save(userSave).then(function(data) {
                                var response = [];
                                var userData = data.toJSON();
                                delete userData.password;
                                response.data = userData; 
                                helper.formatResponse(response, res, '');
                            }).catch(function(error) {
                                helper.formatResponse('', res, error);
                            });
                        }
                    });
                }
            });
        // });
    },

    /**
     * Action for upload image
     * 
     * @method registration
     * @param {req} request
     * @param {res} response
     * @return {status} res -If it returns error then the status is false otherwise true. 
    */

    imageUpload: function(req, res) {
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            if(err) {
                err = {
                    httpstatus: 400,
                    msg: 'Unable to save'
                };
                helper.formatResponse('', res, err);    
            } else {
                var fileName = fields.mobileNo + '_' + files.profilePic[0].originalFilename;
                var newPath = __dirname + '/../../public/' + fileName;
                fs.rename(files.profilePic[0].path, newPath, function() {
                    var profilePic = {
                        name: fileName,
                        filePath: "192.168.11.221/chat/public"
                    }
                    var response = [];
                    response.data = profilePic;
                    helper.formatResponse(response, res, '');    
                });
            }
        });        
    },

    /**
     * Action for friendsList and groups
     * 
     * @method friendsAndGroupList
     * @param {req} request
     * @param {res} response
     * @return {status} res -If it returns error then the status is false otherwise true. 
    */

    friendsAndGroupList : function(req, res) {
        var mobileNo = req. params.mobileNo;
        common.users.userDetails(mobileNo).then(function(userData) {
            common.conversation.userGroups(mobileNo).then(function(groupData) {
                var response = {};
                userData.groups = groupData;
                response.data = userData;
                helper.formatResponse(response, res, '');
            }).catch(function(error) {
                helper.formatResponse('', res, error);
            });
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    } 
};