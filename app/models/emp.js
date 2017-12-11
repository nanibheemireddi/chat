/*
 * Users model schema
 */

var employeSchema = new Schema({
    name: {type: String, required: true},
    mobileNo: {type: String},
    isActive: {type: Boolean, default: false},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true,
    versionKey: false
});

/*
 * create model from schema
 */
var collectionName = 'employe';
var employe = mongoose.model('employe', employeSchema,collectionName);


/*
 * export users model
 */
module.exports = employe;