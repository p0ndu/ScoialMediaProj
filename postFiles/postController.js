// post management functions
async function newPost(collection, post) // creates a new post in the database
{
    // TODO, check that either text or image is present, or ensure to do it outside, prob here though
    try {
        const result = await collection.insertOne(post); // tries to insert post into database
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
};



async function deletePost(collection, postID) // deletes a post from the database by matching id
{
    try {
        const result = await collection.deleteOne({ _id: postID }); // tries to delete post from database
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
};

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
    if (await checkIfLiked(postCollection, postID, userID)) {
        try {
            const postResult = await postCollection.updateOne({ _id: postID}, { $pull: { likes: userID } }); // tries to remove user from post's likes
            const userResult = await userCollection.updateOne({ _id: userID}, { $pull: {likedPosts: postID}}); // tries to remove post from user's liked posts

            return await [postResult, userResult];
        }
        catch (err) {
            console.log(err);
            return 0;
        }
    }
    else{
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


async function searchPost(collection, searchTerm) { // searches for a post by text and returns array of all matching ones
    try {
        const result = await collection.find({ $text: { $search: searchTerm } }).toArray(); // tries to find the post in the database
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}


export { newPost, deletePost, getPoster, addComment, likePost, unlikePost, getNumLikes, searchPost, }; 