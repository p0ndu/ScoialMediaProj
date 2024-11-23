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

async function likePost(collection, postID, userID) { // likes a post by matching id, userID is the user object id of the user who liked the post
    try {
        const result = await collection.updateOne({ _id: postID }, { $push: { likes: userID } }); // tries to add user to post's likes
        return await result;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}


export { newPost, deletePost, getPoster, addComment, likePost };