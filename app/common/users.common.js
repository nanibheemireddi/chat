module.exports = {

    userDetails: function(mobileNo) {
        return new Promise(function(resolve, reject) {
            var agg = [{
                    $match: { mobileNo: mobileNo }
                },
                {
                    $unwind: {
                        path: "$friends",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "friends.mobileNo",
                        foreignField: "mobileNo",
                        as: "friendInfo"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        mobileNo: 1,
                        isActive: 1,
                        "friendInfo._id": 1,
                        "friendInfo.name": 1,
                        "friendInfo.mobileNo": 1,
                        "friendInfo.isActive" :1,
                        "friendInfo.lastSeen" :1,
                        "friendInfo.conversationId": "$friends.conversationId"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        isActive: { $first: "$isActive" },
                        mobileNo: { $first: "$mobileNo" },
                        friends: { $push: { $arrayElemAt: ["$friendInfo", 0] } }
                    }
                },
            ];
            models.users.aggregate(agg, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data[0]);
                }
            });
        });

    }
}