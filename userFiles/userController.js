// import { ObjectId } from "mongodb";

// user management functions

async function newUser(collection, user) { // adds new user to database assumes program has checked that user does not already exist 
    try {
        const result = await collection.insertOne(user); // tries to add user to DB
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function deleteUser(collection, userId) { // remoes user from database by matching id

    try {
        const result = await collection.deleteOne({ _id: userId }); // tries to remove user from DB
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

function logout() {// WIP, logs user out on session storage

}

function login() {// WIP, logs user in on session storage

}

async function changePassword(collection, userId, newPassword) { // changes password of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { password: newPassword } }); // tries to update password to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function changeEmail(collection, userId, newEmail) { // changes email of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { email: newEmail } }); // tries to update email to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function changePhoneNumber(collection, userId, newPhoneNumber) { // changes phone number of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({_id: userId}, { $set: { phoneNumber: newPhoneNumber } }); // tries to update phone number to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function changeUsername(collection, userId, newUsername) { // changes username of user in database by matching id, assumes user exists and has already verified
    try {
        const result = await collection.updateOne({ _id: userId }, { $set: { username: newUsername } }); // tries to update username to new one
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}


// relationship management functions

async function followUser(collection, userId, followedId) { // adds followed user to user's followed list, assumes that user exists and isnt already followed
    try {
        const result = await collection.updateOne({ _id: userId }, { $push: { following: followedId } }); // tries to add followed user to user's followed list
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function unfollowUser(collection, userId, followedId) { // removes followed user from user's followed list, assumes that user exists and is already followed
    try {
        const result = await collection.updateOne({ _id: userId }, { $pull: { following : followedId } }); // tries to remove followed user from user's followed list
        return result
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function blockUser(collection, userId, blockedId) { // adds blocked user to user's blocked list, assumes that user exists and isnt already blocked
    try {
        const result = await collection.updateOne({ _id: userId }, { $push: { blockedUsers: blockedId } }); // tries to add blocked user to user's blocked list
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function unblockUser(collection, userId, blockedId) { // removes blocked user from user's blocked list, assumes that user exists and is already blocked
    try {
        const result = await collection.updateOne({ _id: userId }, { $pull: { blockedUsers: blockedId } }); // tries to remove blocked user from user's blocked list
        return result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

export { newUser, deleteUser, logout, login, changePassword, changeEmail, changePhoneNumber, changeUsername, followUser, unfollowUser, blockUser, unblockUser }; // exports functions for use in other files
