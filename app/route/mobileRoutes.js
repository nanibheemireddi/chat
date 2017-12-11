var mobControllers = require('../mob');

/*
 routes for user 
*/

app.post('/mob/user/login', mobControllers.users.userLogin);
app.post('/mob/user/registration', mobControllers.users.userRegistration);
app.post('/mob/user/registration-v1', mobControllers.users.userRegistrationV1);
app.post('/mob/user/image-upload', mobControllers.users.imageUpload);
app.get('/mob/users', mobControllers.users.getFriends);
app.get('/mob/users/friends-groups/:mobileNo', mobControllers.users.friendsAndGroupList);

/*
 routes for user 
*/
app.post('/mob/add-friend', mobControllers.conversation.addFriendV1);
app.post('/mob/create-group', mobControllers.conversation.createGroup);
app.post('/mob/create-group/add-users', mobControllers.conversation.addUserToGroup);
app.get('/mob/get-messages/:id', mobControllers.conversation.gettingMessages);


/*
routes for default schema
*/

app.get('/config/setup/:modelName', mobControllers.config.insterDefaultMasterData);

/*
 * Employee controller route -- DEMO
*/
app.post('/emp/create', mobControllers.emp.create);
app.get('/emp/find-one/:id', mobControllers.emp.findOne);
app.get('/emp/find', mobControllers.emp.find);
app.post('/emp/update', mobControllers.emp.update);
app.post('/emp/bulkSave', mobControllers.emp.bulkSave);
app.delete('/emp/delete/:id', mobControllers.emp.delete);