module.exports = {
    /*
     * Helper function to validate all required parameters.
     * return ===> error = httpstatus 422, success = true.
     */

    validateRequiredParams: function (req, res, requiredParams) {
        return new Promise(function (resolve, reject) {
            var errorCount = 0;
            var missingParams = [];
            requiredParams.forEach(function (obj) {
                if (typeof req.body[obj] == 'undefined' || req.body[obj] == '') {
                    errorCount++;
                    missingParams.push(obj);
                }
            });
            if (errorCount > 0) {
                var error = {
                    success: false,
                    httpstatus: 422,
                    msg: 'Missing required parameters',
                    data: {
                        missingParams: missingParams
                    }
                };
                helper.formatResponse(error, res);
            } else {
                resolve({
                    success: true,
                    data: []
                });
            }

        })
    },
    /*
     * Helper function to format all error and success response to maintain common format
     * return json output
     */

    formatResponse: function (response, res, error) {
        // console.log('catch response',response);
        // console.log(error,"error");
        var httpstatus = 200;
        if (typeof response.httpstatus != 'undefined' && response.httpstatus != '') {
            var httpstatus = response.httpstatus;
        }
        if (httpstatus != 200 && process.env.WINSON_ERROR_LOG == true) {
            winston.log('error', response);
        }
        var output = {};
        if (response !== '') {
            var successStatus = true;
            output['success'] = successStatus;
            if (typeof response.msg != 'undefined' && response.msg != '') {
                var responseMessage = response.msg;
                output['msg'] = responseMessage;
            }
            if (typeof response.data != 'undefined' && response.data != '') {
                var responseData = response.data;
                output['data'] = responseData;
            }
        } else {
            // console.log(error);
            // return false;
            var successStatus = false;

            if (typeof error.httpstatus != 'undefined' && error.httpstatus != '') {
                var httpstatus = error.httpstatus;
                delete error.httpstatus;
            } else {
                var httpstatus = helper.getHttpStatusFromMongooseError(error.code);
            }
            output = {
                success: successStatus,
                msg: error.msg,
            }
            // console.log(output, "output");
        }
        // console.log('output',output);
        res.status(httpstatus).json(output)
    },
    /*
     * Helper function to get http status code from mongoose error code to maitain common format
     * return error code {integer}
     */

    getHttpStatusFromMongooseError: function (errorCode) {
        var codeLibrary = {};
        var code = '';
        codeLibrary = {
            '11000': 409
        };
        if ((typeof codeLibrary[errorCode] != 'undefined') && codeLibrary[errorCode] != '') {
            code = codeLibrary[errorCode];
        } else {
            code = 400; // default
        }
        return code;
    },
    /*
     * Helper function to parse unique field name from moongose error syntex.
     * return ===> error = httpstatus 422, success = true.
     */

    parseUniqueFieldError: function (errorCode) {
        var field = errorCode.message.split('index: ')[1];
        // now we have `keyname_1 dup key`
        field = field.split(' dup key')[0];
        field = field.substring(0, field.lastIndexOf('_')); // returns keyname
        return field;
    },
    /*
     * checking for admin 
     */
    isAdmin: function (userRole) {
        if (userRole == 'Admin') {
            return true;
        } else {
            return false;
        }
    },
    basename: function (path) {
        return path.split('/').reverse()[0];
    }



}	