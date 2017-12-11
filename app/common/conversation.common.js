module.exports = {

    isGroupAdmin: function(groupId, adminMobileNumeber) {
        return new Promise(function(resolve, reject) {
            var agg = [{
                    $match: { _id: new mongoose.Types.ObjectId(groupId) }
       	        },
                {
                    $unwind: {
                        path: "$users",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        "users.mobileNo": adminMobileNumeber,
                        "users.isAdmin": true
                    }
                }
            ];
            models.conversation.aggregate(agg, function(err, data) {
            	if(err) {
            		reject(err);
            	} else {
            		resolve(data);
            	}
            });
        });
    },

    userGroups: function(mobileNo) {
    	return new Promise(function(resolve, reject) {
    		var agg = [
			    {$match: {isGroup: true}},
			    { $redact: {
			        $cond: {
			           if: {$eq:[{$setIntersection : ["$users.mobileNo", [mobileNo]]  },[mobileNo]]},
			           then: "$$KEEP",
			           else: "$$PRUNE"
			         }
			       }
			     },
			     {
			        $unwind: {
			            path: "$users",
			            preserveNullAndEmptyArrays: true
			        }
			    },
			    {
			        $lookup: {
			            from: "users",
			            localField: "users.mobileNo",
			            foreignField: "mobileNo",
			            as: "userInfo"
			        }
			    },
			    {
			        $project:{
			            _id: 1,
			            groupName: 1,
			            isGroup : 1,
			            "userInfo._id":1,
			            "userInfo.mobileNo":1,
			            "userInfo.name":1,
			            "userInfo.isAdmin": "$users.isAdmin"
			        }
			    },
			    {
			        $group: {
			            _id: '$_id',
			            groupName: {$first: "$groupName"},
			            isGroup: {$first: "$isGroup"},
			            users: {$push: { $arrayElemAt: ["$userInfo", 0] }}
			        }
			    },
			    {
			    	$project: {
			    		conversationId: "$_id",
			    		groupName: 1,
			    		isGroup: 1,
			    		users: 1
			    	}
			    },
			    {
			    	$project: {_id: 0}
			    },

			];

			models.conversation.aggregate(agg, function(err, data){
				if(err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
    	});
    }

}