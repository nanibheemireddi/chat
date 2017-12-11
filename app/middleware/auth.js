/*
 * Authencation middleware with session
 
 * list of allowed URLs without login
 */
var jwt = require('jsonwebtoken');
var allowed = [];



function checkIfRouteExistInAllowedList(route, method) {    
    var evens = _.filter(allowed, function (obj) {        
        return route.indexOf(obj.url) !== -1 && (obj.method === "ALL" || obj.method === method);    
    });    
    if (evens.length > 0) {        
        return true;    
    } else { 
        return false;    
    }
}
/**
 *  middleware enabled or not
 * @type Boolean
 */
var enabled = true;

/**
 * the middleware function
 * @param {type} onoff : to enable momoddleware
 * @returns {Function}
 */
module.exports = function (onoff) {
    enabled = (onoff == 'on') ? true : false;
    return function (req, res, next) {
        global.requestLanguage = req.headers.language;
        var originalUrlAllowed = checkIfRouteExistInAllowedList(req.originalUrl, req.method);
        if (enabled && originalUrlAllowed === false) {
            // check header or url parameters or post parameters for token
            var token = req.headers['x-access-token'];
            // decode token
            if (typeof token !== 'undefined' && token)
            {
                // verifies secret and checks exp
                jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        helper.formatResponse('',res,"Failed to authenticate token.");
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        if(typeof decoded._doc.userRole !== 'undefined' && decoded._doc.userRole){
                            global.userRole = decoded._doc.userRole.roleName;
                        } else {
                            global.userRole = '';
                        }
                        // console.log(decoded._doc);
                        if(typeof decoded._doc !== 'undefined'){
                            global.requestUserId = decoded._doc._id;
                            global.requestCityId = decoded._doc.city;
                        }else{
                            global.requestUserId = '';
                            global.requestCityId = '';                                
                        }
                        next();
                    }
                });
            } else {
                // console.log('dsd');
                // if there is no token
                var error = {
                    httpstatus : 401,
                    msg : appMessage.common.error.noToken.msg
                };
                helper.formatResponse('',res,error);
            }
        } else {
             var token = req.headers['x-access-token'];
            if (typeof token !== 'undefined' && token)
            {
                // verifies secret and checks exp
                jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
                    if (err) {
                        helper.formatResponse('',res,"Failed to authenticate token.");
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;

                        if(typeof decoded._doc !== 'undefined'){
                            global.requestUserId = decoded._doc._id;
                            global.requestCityId = decoded._doc.city;
                        }else{
                            global.requestUserId = '';
                            global.requestCityId = '';
                        }
                        next();
                    }
                });
            } else {
                global.requestUserId = '';
                global.requestCityId = '';
                next();
            }
            
        }
    }
};