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
    try {
        request.session.email = null;
        return 200;
    }
    catch (err) {
        return 100;
    }
}

async function login(collection, request, email, password) {
    try {
        const userData = await collection.findOne({ email: email });

        if (userData && userData.email === email && userData.password === password) {
            request.session.email = userData.email;
            request.session.userId = userData._id;
            return { status: 200, session: { userId: userData._id } };
        }

        return { status: 401 }; // Unauthorized if credentials are incorrect
    } catch (err) {
        console.log(err);
        return { status: 500 };
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

async function followUser(collection, userId, followedId) {
    const isFollowingResult = await isFollowing(collection, userId, followedId);

    if (!isFollowingResult) {
        try {
            const result = await collection.updateOne(
                { _id: userId },
                { $push: { following: new ObjectId(followedId) } } // Force ObjectId
            );

            console.log('Follow successful:', result);
            return result;
        } catch (err) {
            console.log('Error during follow operation:', err);
            return 100;
        }
    }

    return 'User is already following';
}


async function unfollowUser(collection, userId, followedId) {
    const isFollowingResult = await isFollowing(collection, userId, followedId);

    if (isFollowingResult) {
        try {
            const result = await collection.updateOne(
                { _id: userId },
                { $pull: { following: new ObjectId(followedId) } } // Ensure it's `ObjectId`
            );

            console.log('Unfollow successful:', result);
            return result;
        } catch (err) {
            console.log('Error during unfollow operation:', err);
            return 200;
        }
    }

    return 'Not currently following';
}


async function getFollowing(collection, userId) { // gets all users that a user is following
    try {
        const user = await collection.findOne({ _id: userId }); // tries to find user in database
        return user.following;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
}

async function isFollowing(collection, followerId, followeeId) {
    try {
        console.log('Checking if ', followerId, ' is following', followeeId);
        const user = await collection.findOne({ _id: new ObjectId(followerId) });
        // console.log('User:', user);
        

        let following = false;

        if (!user || !user.following) {
            console.log('User has no following list.');
            return false;
        }

        for (const followee of user.following) {
            if (followee.equals(followeeId)) {
                following = true;
            }
        }


        console.log('Is user following?:', following);
        console.log(followerId, " \t ", followeeId);
        
        return following;
    } catch (error) {
        console.error('Error performing isFollowing check:', error);
        return false;
    }
}






async function searchUser(collection, query) {
    try {
        const result = await collection.findOne({ _id: new ObjectId(query) }); // tries to match user in database to query object id, regex is case insensitive and attempts to match query within username(similar to substring)
        return await result;
    } catch (err) {
        console.log(err);
        return 100;
    } //{ $regex: new RegExp(`${query}`, 'i') } 
}

// -- blocking -- 

async function toggleBlockUser(collection, userId, blockedId) {
    try {
        // Find the user and check if the user is already blocked
        const user = await collection.findOne({ _id: userId });
        
        if (!user) {
            return "User does not exist";
        }

        const isBlocked = user.blockedUsers?.some(blocked => blocked.equals(blockedId)) || false;

        if (!isBlocked) { // If not already blocked, add them to the blocked list
            const result = await collection.updateOne(
                { _id: userId },
                { $push: { blockedUsers: blockedId } }
            );
            return { action: "blocked", result };
        } else { // If already blocked, remove them from the blocked list
            const result = await collection.updateOne(
                { _id: userId },
                { $pull: { blockedUsers: blockedId } }
            );
            return { action: "unblocked", result };
        }
    } catch (err) {
        console.log("Error toggling block:", err);
        return { error: "Unable to toggle block" };
    }
}


export { newUser, deleteUser, logout, login, isLoggedIn, changePassword, changeEmail, changePhoneNumber, changeUsername, followUser, unfollowUser, getFollowing, searchUser, toggleBlockUser, isFollowing }; // exports functions for use in other files


