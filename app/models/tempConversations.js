/*
 * friends model schema
 */

var tempConversationSchema = new Schema({
	userMobileNo: {type: String},
	chatId: {type: Schema.Types.ObjectId, ref: 'conversation'},
	messages: [{
			senderMobileNo: {type: String},
			message: {type: String},
			timeOfCreation: {type: Date, default: Date.now},
			isSend: {type: Boolean, default: false},
		}	
	],
	isActive: {type: Boolean, default: true},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true,
    versionKey: false
});

/*
 * create model from schema
 */
var collectionName = 'tempConversations';
var tempConversations = mongoose.model('tempConversations', tempConversationSchema,collectionName);


/*
 * export users model
 */
module.exports = tempConversations;