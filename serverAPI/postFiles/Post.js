class Post {
    poster; // user who made the post
    text; // text on post, post needs either text or image but can have both
    image; // image on post, think about how to store this
    createdAt; // time it was posted
    likes; // array of users who liked the post, will hold their user object id's
    comments; // array of comments on the post, will hold the comment and the user object id of the user who made it

    constructor(poster, text = undefined, image = undefined) { //optional text and image depending on type of post
        this.poster = poster;
        this.text = text;
        this.image = image;
        this.createdAt = Date.now();
        this.likes = [];
        this.comments = [];

        if (this.text === undefined && this.image === undefined) { // throws error if neither text or image was supplied
            throw new Error('Post must have either text or image');
        }
    }
}

export default Post;

