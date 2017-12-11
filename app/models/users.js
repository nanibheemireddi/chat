/*
 * Users model schema
 */

var userSchema = new Schema({
    name: {type: String, required: true},
    mobileNo: {type: String, unique: true},
    password: {type: String, required: true},
    friends: [{mobileNo: {type: String}, conversationId:{type: Schema.Types.ObjectId, ref: 'conversation'}}],
    profilePic: {
    	name: {type: String},
    	filePath: {type: String},
    },
    isActive: {type: Boolean, default: false},
    isDelete: {type: Boolean, default: false},
    lastSeen: {type: Date}
}, {
    timestamps: true,
    versionKey: false
});

/*
 * create model from schema
 */
var collectionName = 'users';
var users = mongoose.model('users', userSchema,collectionName);


/*
 * export users model
 */
module.exports = users;