module.exports = {

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for creating new employee
     */

    create: function(req, res) {
        var requiredParams = ['name'];
        helper.validateRequiredParams(req, res, requiredParams).then(function() {
            var postData = req.body;
            var empSave = new models.emp(postData);
            _mongoose.save(empSave).then(function(empSave) {
                var response = [];
                response.data = empSave;
                helper.formatResponse(response, res, '');
            }).catch(function(error) {
                helper.formatResponse('', res, error.error);
            });
        })
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : This is for bulk insert
     */

    bulkSave: function(req, res) {
        var modelData = [{
            "name": "kotecha",
            "username": "kotecha",
            "password": "3"
        }, {
            "name": "rushil",
            "username": "rushil151",
            "password": "3"
        }];
        var modelName = 'emp';
        _mongoose.bulkSave(modelName, modelData).then(function(empSave) {
            var response = [];
            response.data = empSave;
            helper.formatResponse(response, res, '');
        }).catch(function(error) {
            helper.formatResponse('', res, error.error);
        });
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : find records from db using given conditions
     */

    findOne: function(req, res) {
        var id  = req.params.id;
        models.emp.findOne({_id:id}).exec(function(err,data) {
            if(err) {
                helper.formatResponse('', res, err);
            } else {
                var response = [];
                response.data = data;
                helper.formatResponse(response, res, '');
            }
        });
        
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : find all records from db using given conditions
     */

    find: function(req, res) {
        var modelName = models.emp;
        var condition = req.body;
        models.emp.find().exec(function(err, data) {
            if (err) {
                helper.formatResponse('', res, err);
            } else {
                var response = [];
                response.data = data;
                helper.formatResponse(response, res, '');
            }
        })
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : update given data in db suing given conditions
     */

    update: function(req, res) {
        var modelName = models.emp;
        var condition = { 'username': 'rushil151' };
        var updateParams = {
            'name': 'rushil',
            'password': '8'
        };
        _mongoose.update(modelName, condition, updateParams).then(function(data) {
            var response = [];
            response.data = data;
            helper.formatResponse(response, res, '');
        }).catch(function(error) {
            helper.formatResponse('', res, error);
        });
    },

    /*
     * @param {type} req
     * @param {type} res
     * @returns {}
     * @desc : update given data in db suing given conditions
     */

    delete: function(req, res) {
        var condition = { _id: req.params.id};
        models.emp.deleteOne(condition,function(err,data) {
            if(err) {
                helper.formatResponse('', res, err);
            } else {
                var response = [];
                response.msg = "record deleted successfully.";
                helper.formatResponse(response, res, '');
            }
        });
    },
}