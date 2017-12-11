/*
 * Users model schema
 */

var articleSchema = new Schema({
    subject: {type: String, required: true},
    author: {type: String},
    views: {type: Number},
    isActive: {type: Boolean, default: false},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true,
    versionKey: false
});

/*
 * create model from schema
 */
var collectionName = 'articles';
var articles = mongoose.model('articles', articleSchema, collectionName);


/*
 * export users model
 */
module.exports = articles;