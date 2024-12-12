import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import * as userController from "../serverAPI/userFiles/userController.js";
import User from '../serverAPI/userFiles/User.js';
import * as postController from '../serverAPI/postFiles/postController.js';
import Post from '../serverAPI/postFiles/Post.js';
import { ObjectId } from 'mongodb';
// express functions to handle webService

async function startService(userCollection, postCollection) {
    const studentID = "/M00946088"; // student ID
    const expressServer = express(); // create express server object
    expressServer.use(bodyParser.json()); // use body parser to parse json
    expressServer.use(express.static('public')); // serve static files from public folder
    expressServer.use(expressSession({
        secret: "secString",
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: true
    }))
    expressServer.listen(8080); // listen on port 8080
    console.log("Express setup (listening on port 8080)\n");


    console.log("initialising requests\n");
    try {
        expressServer.post(studentID + '/users', async (req, res) => { // post request to create new user, req needs to be JSON object with required userData
            const user = new User(req.body.username, req.body.password, req.body.email, req.body.name, req.body.phoneNumber, req.body.age); // create user object
            const result = await userController.newUser(userCollection, user); // pushes user to database

            res.send(result); // sends result back to client
        })

        expressServer.get(studentID + '/contents/followed', async (req, res) => { // returns posts of people followed by user
            try {
                const user = await userCollection.findOne({ email: req.session.email });
                if (!user) {
                    res.status(401).send({ error: "User not found or not logged in" });
                    return;
                }

                const following = user.following;
                //   console.log("Following list:", following); // debugging, posts are defined here

                const posts = await postController.getPosts(postCollection, userCollection, following);

                res.send(posts);
            } catch (error) {
                console.log(error);
                res.status(500).send({ error: "Could not fetch posts" });
            }
        })

        expressServer.get('/M00946088/contents', async (req, res) => { // returns all posts, not required but useful to not make the site look absolutely dead
            try {
                const posts = await postCollection.find().toArray(); // Retrieve all posts
                res.json(posts);
            } catch (error) {
                console.error('Error fetching all posts:', error);
                res.status(500).json({ error: "Could not fetch posts" });
            }
        });


        expressServer.post(studentID + '/login', async (req, res) => {
            const result = await userController.login(userCollection, req, req.body.email, req.body.password);

            if (result.status === 200) {
                res.send({ loginStatus: true, userId: result.session.userId });
            } else {
                res.send({ loginStatus: false });
            }
        });


        expressServer.delete(studentID + '/login', async (req, res) => { // delete request to logout user
            const result = await userController.logout(req); // logs user out

            if (result === 200) {
                res.send({ logoutStatus: true });
            }
            else {
                res.send({ logoutStatus: false });
            }
        })

        expressServer.get(studentID + '/login', async (req, res) => { // get request to check if user is logged in
            const result = await userController.isLoggedIn(req); // checks if user is logged in
            if (result === 200) {
                res.send({ isLoggedIn: true });
            }
            else if (result === 100) {
                res.send({ isLoggedIn: false });
            }
            else {
                res.send({ isLoggedIn: "error" });
            }
        })

        expressServer.post(studentID + '/contents', async (req, res) => { // post request to create new post, req needs to be JSON object with required post data
            const poster = new ObjectId(req.body.poster);
            const post = new Post(poster, req.body.text); // create post object
            const result = await postController.newPost(postCollection, post); // pushes post to database

            if (result === 200) {
                res.send({ postStatus: true });
            }
            else {
                res.send({
                    postStatus: false,
                    ErrorMessage: result
                });
            }
        })

        expressServer.post(studentID + '/follow', async (req, res) => { // post request to follow user, req needs to be JSON object with required follow data, must be logged in
            try {
                let user = req.session.email;
                user = await userCollection.findOne({ email: user });
                const userId = user._id;
                const followeeId = new ObjectId(req.body.followeeId);

                const result = await userController.followUser(userCollection, userId, followeeId);

                if (result && result !== 100) {
                    res.status(200).json({ success: true, message: "Followed user successfully" });
                } else {
                    res.status(400).json({ success: false, message: result });
                }
            } catch (error) {
                console.error('Error in follow route:', error);
                res.status(500).json({ success: false });
            }
        })

        expressServer.delete(studentID + '/follow', async (req, res) => { // delete request to unfollow user, req needs to be JSON object with required follow data, must be logged in
            try {
                let user = req.session.email;
                user = await userCollection.findOne({ email: user });
                const userId = user._id;
                const followeeId = new ObjectId(req.body.followeeId);

                const result = await userController.unfollowUser(userCollection, userId, followeeId);

                if (result && result !== 200) {
                    res.status(200).json({ success: true, message: "Unfollowed user successfully" });
                } else {
                    res.status(400).json({ success: false, message: result });
                }
            } catch (error) {
                console.error('Error in unfollow route:', error);
                res.status(500).json({ success: false });
            }
        })

        expressServer.get(studentID + '/users/search', async (req, res) => { // get request to search for user, search term is passed by query 
            try {
                const query = req.query.q; // gets query q from search

                const result = await userController.searchUser(userCollection, query.trim());

                res.send(result);

            } catch (err) {
                console.log(err);
            }
        })

        expressServer.get(studentID + '/contents/search', async (req, res) => { // get request to search for post, search term is passed by query
            try {
                const query = req.query.q; // gets query q from search

                const result = await postController.searchPost(postCollection, query.trim());

                res.send(result);

            } catch (err) {
                console.log(err);
            }
        })

        expressServer.get('/M00946088/users/getUserById', async (req, res) => { // returns username by matching object id
            try {
                const { userId } = req.query;

                if (!userId) {
                    return res.status(400).json({ error: "User ID is required" });
                }

                const user = await userController.searchUser(userCollection, userId);
                // console.log("fetched user within webservice : ", await user);


                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({
                    username: user.username,
                    email: user.email,
                });
            } catch (error) {
                console.error('Error fetching user by ID:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        expressServer.get(studentID + '/isLoggedIn', async (req, res) => { // returns if user is logged in
            try {
                const result = userController.isLoggedIn(req);
                if (result === 200) {
                    res.status(200).send({ isLoggedIn: true });
                } else if (result === 100) {
                    res.status(200).send({ isLoggedIn: false });
                } else {
                    res.status(500).send({ error: "Unexpected error checking login status" });
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                res.status(500).send({ error: "Could not determine login status" });
            }
        });

        expressServer.get(studentID + '/isFollowing', async (req, res) => {

            try {
                const { followerId, followeeId } = req.query;


                if (!followerId || !followeeId) {
                    return res.status(400).json({ error: "Both followerId and followeeId are required" });
                }

                const isFollowingResult = await userController.isFollowing(userCollection, followerId, followeeId);

                res.status(200).json({ isFollowing: isFollowingResult });
            } catch (error) {
                console.error('Error checking follow status:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        expressServer.get(studentID + '/users/block', async (req, res) => { // block a user
            try {
                const { blockerId, blockeeId } = req.query;

                if (!blockerId || !blockeeId) {
                    return res.status(400).json({ error: "Both blockerId and blockeeId are required" });
                }

                userController.toggleBlockUser(userCollection, blockerId, blockeeId);

                res.status(200).json({ success: true });

            } catch (error) {
                console.error('Error blocking user:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        expressServer.get(studentID + '/userId', async (req, res) => { // Get a user's ID by their email
            try {
                const email = req.session.email;

                if (!email) {
                    return res.status(400).json({ error: "Email is required" });
                }

                const user = await userCollection.findOne({ email });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({ userId: user._id });
            } catch (error) {
                console.error('Error fetching user ID:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });



        expressServer.get(studentID + '/posts/like', async (req, res) => { // like a post
            try {
                const { postId, userId } = req.query;

                if (!postId || !userId) {
                    return res.status(400).json({ error: "Both postId and userId are required" });
                }

                const likeResult = await postController.likePost(postCollection, postId, userId);

                if (likeResult === 200) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(400).json({ success: false, message: likeResult });
                }
            }
            catch (error) {
                console.error('Error liking post:', error);
                res.status(500).json({ success: false });
            }

        })

        expressServer.get(studentID + '/posts/unlike', async (req, res) => { // unlike a post

            try {
                const { postId, userId } = req.query;

                if (!postId || !userId) {
                    return res.status(400).json({ error: "Both postId and userId are required" });
                }

                const unlikeResult = await postController.unlikePost(postCollection, postId, userId);

                if (unlikeResult === 200) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(400).json({ success: false, message: unlikeResult });
                }
            }
            catch (error) {
                console.error('Error unliking post:', error);
                res.status(500).json({ success: false });
            }
        });

        expressServer.get(studentID + '/posts/isLiked', async (req, res) => { // check if a post is liked by a user
            try {
                const { postId, userId } = req.query;

                if (!postId || !userId) {
                    return res.status(400).json({ error: "Both postId and userId are required" });
                }

                const isLiked = await postController.checkIfLiked(postCollection, postId, userId);
                
                res.status(200).json({ isLiked });
            }
            catch (error) {
                console.error('Error checking if post is liked:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
        );

        console.log("requests initialised\n");

    }
    catch (err) {
        console.log(err);
    }

}





export { startService }; // export function to start service



