/*
 * friends model schema
 */

var conversationSchema = new Schema({
	// userId: {type: Schema.Types.ObjectId, ref: 'users'},
	// mobileNo: {type: String},
	users: [ {mobileNo: {type: String}, isAdmin:{type: Boolean, default: false}} ],
	groupName: {type: String},
	isGroup: {type: Boolean, default: false},
	messages: [{
			senderMobileNo: {type: String},
			message: {type: String},
			timeOfCreation: {type: Date, default: Date.now},
		}	
	],
	groupCreatedBy: {type: String},
	isActive: {type: Boolean, default: true},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true,
    versionKey: false
});

/*
 * create model from schema
 */
var collectionName = 'conversation';
var conversation = mongoose.model('conversation', conversationSchema,collectionName);


/*
 * export users model
 */
module.exports = conversation;