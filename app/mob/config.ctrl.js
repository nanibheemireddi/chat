var defaultMasterData = require('../helpers/defaultSchema');
var asyncLoop = require('node-async-loop');
var bcrypt = require("bcrypt-nodejs");
var randomstring = require("randomstring");

module.exports = {
    insterDefaultMasterData: function (req, res, next) {
        var masterCountor = 0;
        var modelName = req.params.modelName;
        // console.log(defaultMasterData[modelName]);
        // return false;
        if (typeof modelName != 'undefined' && modelName != '') {
            _mongoose.bulkSave(modelName, defaultMasterData[modelName]).then(function (empSave) {
                res.json({
                    success: true
                });
            }).catch(function (error) {
                // console.log('error');
                helper.formatResponse('', res, error.error);
            });
        } else {
            _.each(defaultMasterData, function (elm, ind) {
                _mongoose.bulkSave(ind, elm).then(function (empSave) {

                    masterCountor++;
                    if (_.size(defaultMasterData) == masterCountor) {
                        res.json({
                            success: true
                        });
                    }
                }).catch(function (error) {
                    helper.formatResponse('', res, error.error);
                });
            });
        }
    },
    bulkUserInsert: function (req, res, next) {
        var data = [];
        asyncLoop(data, function (item, next) {
            var insertData = new models.users({
                name: item.name,
                type: item.type,
                email: item.email,
                password: bcrypt.hashSync(item.password),
                udid: item.udid,
                deviceType: item.deviceType,
                country: item.country,
                state: item.state,
                city: item.city,
                isVerified: item.isVerified,
                preferredCity: item.city,
                profilePic: {fileName: 'user-profile-default-icon.png', fileSize: '1024', folderName: 'profile/users/'}
            });
            _mongoose.save(insertData).then(function (outputData) {
                var bubData = new models.bubs({
                    createdBy: outputData._id,
                    updatedBy: outputData._id,
                    name: item.bubName,
                    dob: item.dob,
                    petType: item.petType,
                    petSize: item.petSize,
                    breed: item.breed,
                    gender: item.gender,
                });
                _mongoose.save(bubData).then(function (out) {
//                    console.log(out, 'out');
                    next();
                }).catch(function (error) {
                    // console.log('error',error);
//                    helper.formatResponse('', res, error);
                    next();
                });

            }).catch(function (error) {
                // console.log('error',error);
                next();
//                helper.formatResponse('', res, error);

            });
            ;


        }, function (error) {
            if (error) {
                helper.formatResponse('', res, error);
            }
            var response = {};
            response = appMessage.common.success.fileImport;
            helper.formatResponse(response, res, '');
        });


    }
};
