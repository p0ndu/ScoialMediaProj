// -- user management functions --
// -- creation and deletion --
import { ObjectId } from "mongodb";

async function newUser(collection, user) { // adds new user to database assumes program has checked that user does not already exist 
    try {
        const result = await collection.insertOne(user); // tries to add user to DB
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function deleteUser(collection, userId) { // remoes user from database by matching id

    try {
        const result = await collection.deleteOne({ _id: userId }); // tries to remove user from DB
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

// -- session management functions (maybe move these somewhere else) -- 

function logout(request) {// WIP, logs user out on session storage
    try{
        request.session.email = null;
        return 200;
    }
    catch(err){
        return 100;
    }
}

async function login(collection, request, email, password) {// WIP, logs user in on local storage
    try {
        const userData = await collection.findOne({ email: email }); // tries to find user in database

        if ((userData.email === email) && (userData.password === password) ){
            request.session.email = userData.email;
            return 200;
        }
    }
    catch (err) {
        console.log(err);
        return 100;

    }
}

function isLoggedIn(request) { // WIP, checks if user is logged in on local storage
    if (request.session.email != null) {
        return 200;
    }
    else {
        return 100;
    }
}

// -- changing credentials -- 

async function changePassword(collection, userId, newPassword) { // changes password of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { password: newPassword } }); // tries to update password to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function changeEmail(collection, userId, newEmail) { // changes email of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { email: newEmail } }); // tries to update email to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function changePhoneNumber(collection, userId, newPhoneNumber) { // changes phone number of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { phoneNumber: newPhoneNumber } }); // tries to update phone number to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function changeUsername(collection, userId, newUsername) { // changes username of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { username: newUsername } }); // tries to update username to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

// -- relationship management functions -- 
// -- following --

async function followUser(collection, userId, followedId) { // adds followed user to user's followed list, assumes that user exists and isnt already followed
    if (!await isFollowing(collection, userId, followedId)) { // checks if user is following
        try {
            const result = await collection.updateOne({ _id: userId }, { $push: { following: followedId } }); // tries to add followed user to user's followed list
            return result;
        }
        catch (err) {
            console.log(err);
            return 100;
        }
    }
    else {
        return "User is already following";
    }
}

async function unfollowUser(collection, userId, followedId) { // removes followed user from user's followed list, assumes that user exists and is already followed
    const isFollowingResult = isFollowing(collection, userId, followedId)
    if (isFollowingResult) { // checks if user is following
        try {
            const result = await collection.updateOne({ _id: userId }, { $pull: { following: followedId } }); // tries to remove followed user from user's followed list

            return result;
        }
        catch (err) {
            console.log(err);
            return 200;
        }
    }
    else {
        return 100;
    }
}

async function getFollowing(collection, userId) { // gets all users that a user is following
    try{
        const user = await collection.findOne({ _id: userId}); // tries to find user in database
        return user.following;
    }
    catch(err){
        console.log(err);
        return 100;
    }
}

async function isFollowing(collection, userId, followedId) { // checks if a user is following another user
    try {
        const user = await collection.findOne({ _id: userId }, { following: followedId }); // tries to find user in database
        return user.following.some(followed => followed === followedId); // returns if followedId is in user
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function searchUser(collection, query){
    try{
        const result = await collection.find({_id: new ObjectId(query)}).toArray(); // tries to match user in database to query object id, regex is case insensitive and attempts to match query within username(similar to substring)
        return await result;
    }catch(err){
        console.log(err);
        return 100;
    } //{ $regex: new RegExp(`${query}`, 'i') } 
}

// -- blocking -- 

async function blockUser(collection, userId, blockedId) { // adds blocked user to user's blocked list, assumes that user exists and isnt already blocked
    if (!await isUserBlocked(collection, userId, blockedId)) { // checks if user is blocked
        try {
            const result = await collection.updateOne({ _id: userId }, { $push: { blockedUsers: blockedId } }); // tries to add blocked user to user's blocked list
            return result;
        }
        catch (err) {
            console.log(err);
            return 100;
        }
    }
    else {
        return "User is already blocked";
    }
}

async function unblockUser(collection, userId, blockedId) { // removes blocked user from user's blocked list, assumes that user exists and is already blocked
    if (await isUserBlocked(collection, userId, blockedId)) { // checks if user is blocked
        {
            try {
                const result = await collection.updateOne({ _id: userId }, { $pull: { blockedUsers: blockedId } }); // tries to remove blocked user from user's blocked list
                return result;
            }
            catch (err) {
                console.log(err);
                return 100;
            }
        }
    }
    else {
        return "User is not blocked";
    }
}

async function isUserBlocked(collection, userId, blockedId) { // checks if a user is blocked by another user
    try {
        const user = await collection.findOne({ _id: userId }, { blockedUsers: blockedId }); // tries to find user in database
        return await user.blockedUsers.some(blocked => blocked.equals(blockedId)); // returns if blockedId is in user
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

export { newUser, deleteUser, logout, login, isLoggedIn, changePassword, changeEmail, changePhoneNumber, changeUsername, followUser, unfollowUser, getFollowing, searchUser,  blockUser, unblockUser }; // exports functions for use in other files
