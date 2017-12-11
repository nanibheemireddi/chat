module.exports = {
    /*
     * Mongoose library function to save
     * return promise resolve,reject
     */

    save: function (modelSchema) {
        return new Promise(function (resolve, reject) {
            modelSchema.save().then(function (schemaData) {
                // resolve({
                //  data : schemaData
                // });
                resolve(schemaData);
            }).catch(function (error) {
                var errorMsg = {};
                if(!_.isEmpty(error)){
                    errorMsg = error.toJSON();
                }
                var errResponse = {};
                var httpstatus = '400'
                if (error.code == '11000') {
                    errorMsg.fieldName = helper.parseUniqueFieldError(error);
                    errorMsg.msg = helper.parseUniqueFieldError(error) + ' ' + "should be unique";
                    var httpstatus = '409'
                    // errResponse.success = false;
                    errResponse = helper.parseUniqueFieldError(error) + ' ' + "should be unique";
                }
                reject({
                    httpstatus: httpstatus,
                    msg: errResponse
                });
            });
        })
    },
    /*
     * Mongoose library function for bulk save
     * return promise resolve,reject
     */

    bulkSave: function (modelName, modelData) {
        return new Promise(function (resolve, reject) {
            new models[modelName].insertMany(modelData).then(function (docs) {
                resolve({
                    data: docs
                });
            }).catch(function (err) {
                reject({
                    error: err
                });
            });
        })
    },
    /*
     * Mongoose library function to fetch single record based on condition and fields
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    findOne: function (modelName, condition, fields) {
        return new Promise(function (resolve, reject) {
            if (fields !== '') {
                var promise = modelName.findOne(condition).select(fields).exec();
            } else {
                var promise = modelName.findOne(condition).exec();
            }

            promise.then(function (data) {
                if (data !== null) {
                    resolve({
                        data: data
                    });
                } else {
                    reject({
                        httpstatus: 404,
                        msg: "No records available"
                    });
                }
            }).catch(function (error) {
                reject({
                    error: error
                });
            });
        })
    },
    /*
     * Mongoose library function to fetch record based on condition and fields
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    find: function (modelName, condition, fields) {
        return new Promise(function (resolve, reject) {
            if (fields !== '') {
                var promise = modelName.find(condition).select(fields).exec();
            } else {
                var promise = modelName.find(condition).exec();
            }

            promise.then(function (data) {
                if (data !== null) {
                    resolve({
                        data: data
                    });
                } else {
                    reject({
                        httpstatus: 404,
                        msg: "No records available"
                    });
                }
            }).catch(function (error) {
                reject({
                    error: error
                });
            });
        })
    },
    /*
     * Mongoose library function to update records based on condition.
     * fields parameter is not mandatory
     * return promise resolve,reject
     */

    update: function (modelName, condition, updateParams, unsetParams) {
    
        return new Promise(function (resolve, reject) {
            var setUnsetOption = {};
            if (typeof unsetParams != 'undefined' && !_.isEmpty(unsetParams)) {
                setUnsetOption = {$set: updateParams, $unset: unsetParams};
            } else {
                setUnsetOption = {$set: updateParams};
            }
            modelName.findOneAndUpdate(condition, setUnsetOption, {new : true},
                    function (error, data) {
                       if (error) {
                            reject({
                                error: error
                            });
                        } else {
                            if (data !== null) {
                                resolve(data);
                            } else {
                                reject({
                                    httpstatus: 404,
                                    msg: error
                                });
                            }
                        }
                    });

        });
    },
    
    updateAll: function (modelName, condition, updateParams, unsetParams) {
        return new Promise(function (resolve, reject) {
            var setUnsetOption = {};
            if (typeof unsetParams != 'undefined') {
                setUnsetOption = {$set: updateParams, $unset: unsetParams};
            } else {
                setUnsetOption = {$set: updateParams};
            }
            modelName.update(condition, setUnsetOption, {multi: true},
                    function (error, data) {
                        if (error) {
                            reject({
                                error: error
                            });
                        } else {
                            if (data !== null) {
                                resolve({
                                    data: data
                                });
                            } else {
                                reject({
                                    httpstatus: 404,
                                    msg: "No records available"
                                });
                            }
                        }
                    });

        });
    },

    deleteHook: function (modelName, condition) {
        return new Promise(function (resolve, reject) {
            if (typeof modelName.getRelatedSchema == 'function') {
                modelName.getRelatedSchema(function (relatedCollection) {
                    modelName.findOne(condition).select().exec(function (err, doc) {
                        if (err) {
                            reject(err);
                        } else if(typeof doc != 'undefined' && doc !== null && doc != ''){
                            doc.remove(function (err, result) {
                                if (err) {
                                    reject(err);
                                } else {
                                    if (_.isEmpty(relatedCollection)) {
                                        reject(err);
                                    } else {
                                        _.forEach(relatedCollection, function (value) {
                                            var innerCondition = {};
                                            innerCondition[value.fieldName] = result._id;
                                            value.modelName.remove(innerCondition).exec();
                                        });
                                        resolve(doc);
                                    }
                                }
                            });
                        } else {
                            var error = {
                                httpstatus : 400,
                                msg : appMessage.common.error.badRequest.msg
                            }
                            reject(error);
                        }
                    });
                });
            } else {
                modelName.findOne(condition).select().exec(function (err, doc) {
                    if (err) {
                        reject(err);
                    } else if(typeof doc != 'undefined' && doc !== null && doc != ''){
                        doc.remove(function (err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    } else {
                        var error = {
                            httpstatus : 400,
                            msg : appMessage.common.error.badRequest.msg
                        };
                        reject(error);
                    }
                });
            }
        });
    }
}