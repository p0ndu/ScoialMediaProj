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


export { newPost, deletePost };