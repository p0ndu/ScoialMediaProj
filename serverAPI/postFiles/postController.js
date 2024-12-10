// post management functions

import { ObjectId } from "mongodb";

// -- creation and deletion functions -- 
async function newPost(collection, post) // creates a new post in the database
{
    // TODO, check that either text or image is present, or ensure to do it outside, prob here though
    try {
        const result = await collection.insertOne(post); // tries to insert post into database
        console.log(result);

        return 200;
    }
    catch (err) {
        console.log(err);
        return 100;
    }
};

async function deletePost(collection, postID, userID) // deletes a post from the database by matching id
{
    if (await isUsersPost(collection, postID, userID)) { // checks if user is the poster of the post
        try {
            const result = await collection.deleteOne({ _id: postID }); // tries to delete post from database
            console.log(result);
            return 200;
        }
        catch (err) {
            console.log(err);
            return 100;
        }
    }
    else {
        return 300;
    }
};

async function isUsersPost(collection, postID, userID) { // checks if user is the poster of a post by matching ids
    try {
        const result = await collection.findOne({ _id: postID }); // tries to find the post in the database
        return await result.poster.equals(userID);
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function getPoster(collection, postID) { // gets the poster of a post by matching id
    try {
        const result = await collection.findOne({ _id: postID }); // tries to find the post in the database
        return await result.poster;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

// -- comment related functions --

async function getNumOfComments(collection, postID) { // gets the number of comments on a post by matching id, not currently in use but could be useful later
    try {
        const post = await collection.findOne({ _id: postID }); // tries to find the post in the database
        return await post.comments.length;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function addComment(collection, postID, comment) { // adds a comment to a post by matching id, comment is an object with the comment and the user object id of the user who made it
    try {
        const result = await collection.updateOne({ _id: postID }, { $push: { comments: comment } }); // tries to add comment to post in database
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }

}

async function deleteComment(collection, postID, userID) { // deletes a comment from a post by matching ids
    if (await isUsersComment(collection, postID, userID)) { // checks if the user made the comment
        {
            try {
                const result = await collection.updateOne({ _id: postID }, { $pull: { comments: { commenterID: userID } } }); // tries to remove comment from post in database
                return await result;
            }
            catch (err) {
                console.log(err);
                return 0;
            }
        }
    }
}

async function isUsersComment(collection, postID, userID) { // checks if user has commented on post, not necessarily which comment it is. maybe return an index? TODO
    try {
        const result = await collection.findOne({ _id: postID }); // tries to find the comment in the database
        return await result.comments.some(comment => comment.commenterID.equals(userID)); // returns if userid is in comments
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

// -- like related functions --

async function likePost(postCollection, userCollection, postID, userID) { // if user has not already liked the post, adds user to post's likes and post to user's liked posts
    if (! await checkIfLiked(postCollection, postID, userID)) { // checks if user has not liked the post yet
        try {
            const postResult = await postCollection.updateOne({ _id: postID }, { $push: { likes: userID } }); // tries to add user to post's likes
            const userResult = await userCollection.updateOne({ _id: userID }, { $push: { likedPosts: postID } }); // tries to add post to user's liked posts

            return await [postResult, userResult];
        }
        catch (err) {
            console.log(err);
            return 0;
        }
    }
    else {
        return "User has already liked this post";
    }
}

async function unlikePost(postCollection, userCollection, postID, userID) { // if user has liked the post, removes user from post's likes and post from user's liked posts
    if (await checkIfLiked(postCollection, postID, userID)) { // checks if user has liked the post
        try {
            const postResult = await postCollection.updateOne({ _id: postID }, { $pull: { likes: userID } }); // tries to remove user from post's likes
            const userResult = await userCollection.updateOne({ _id: userID }, { $pull: { likedPosts: postID } }); // tries to remove post from user's liked posts

            return await [postResult, userResult];
        }
        catch (err) {
            console.log(err);
            return 0;
        }
    }
    else {
        return "User has not liked this post";
    }
}

async function checkIfLiked(collection, postID, userID) { // checks if a user has liked a post by matching ids
    try {
        const result = await collection.findOne({ _id: postID }); // tries to find the post in the database
        return await result.likes.some(like => like.equals(userID));
    }
    catch (err) {
        console.log(err);
        return 0;
    }

}

async function getNumLikes(collection, postID) { // gets the number of likes on a post by matching id
    try {
        const result = await collection.findOne({ _id: postID }); // tries to find the post in the database
        return await result.likes.length;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

// -- searching for posts -- 

async function searchPost(collection, query) { // searches for a post by text and returns array of all matching ones
    try {
        const result = await collection.find({ text: { $regex: new RegExp(`${query}`, 'i') } }).toArray(); // tries to find the post in the database
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

async function getPosts(postCollection, userCollection, following) {
    console.log("Following list:", following);

    try {
        const posts = [];

        // Retrieve all posts for each followed user
        for (const userId of following) {
            const objBuffer = new ObjectId(userId.toString());
            const userPosts = await postCollection.find({ poster: objBuffer }).toArray();
            posts.push(...userPosts); // still not super sure how i feel about the spread operator but whatever
        }

        // Format posts to include usernames
        const formattedPosts = await formatPosts(postCollection, userCollection, posts);
        return formattedPosts;
    } catch (err) {
        console.error("Error in getPosts:", err);
        return [];
    }
}


async function formatPosts(postCollection, userCollection, posts) {
    try {
        // Get all unique poster IDs from posts
        const userIds = [...new Set(posts.map(post => post.poster))];

        // Fetch corresponding users from the database
        const usersCursor = await userCollection.find({ _id: { $in: userIds } });
        const users = await usersCursor.toArray();

        // Map user IDs to usernames
        const userMap = {};
        for (const user of users) {
            userMap[user._id.toString()] = user.username;
        }

        // Format posts to include usernames instead of ObjectId
        const formattedPosts = posts.map(post => ({
            ...post, // spread poerator, really really weird syntax but it basically just copies object and lets you append to it after. trying it out here but idk if i like it
            username: userMap[post.poster.toString()] || "Unknown User"
        }));

        return formattedPosts;
    } catch (err) {
        console.error("Error in formatPosts:", err);
        return posts; // Return unformatted posts in case of error
    }
}





export { newPost, deletePost, getPoster, addComment, deleteComment, likePost, unlikePost, getNumLikes, searchPost, getPosts }; 