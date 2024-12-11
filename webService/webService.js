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
    try{
        expressServer.post(studentID + '/users', async (req, res) => { // post request to create new user, req needs to be JSON object with required userData
            const user = new User(req.body.username, req.body.password, req.body.email, req.body.name, req.body.phoneNumber, req.body.age); // create user object
            const result = await userController.newUser(userCollection, user); // pushes user to database

            res.send(result); // sends result back to client
        })

        expressServer.get(studentID + '/contents', async (req, res) => { // returns posts of people followed by user
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

          expressServer.get('/M00946088/contents/all', async (req, res) => { // returns all posts, not required but useful to not make the site look absolutely dead
            try {
                const posts = await postCollection.find().toArray(); // Retrieve all posts
                res.json(posts);
            } catch (error) {
                console.error('Error fetching all posts:', error);
                res.status(500).json({ error: "Could not fetch posts" });
            }
        });
        

        expressServer.post(studentID + '/login', async (req, res) => { // get request to login user, req needs to be JSON object with email and password
            const result = await userController.login(userCollection,req, req.body.email, req.body.password); // logs user in

            if (result === 200){
                res.send({loginStatus: true});
            }
            else{
                res.send({loginStatus: false});
            }
        })

        expressServer.delete(studentID + '/login', async (req, res) => { // get request to logout user
            const result = await userController.logout(req); // logs user out

            if (result === 200){
                res.send({logoutStatus: true});
            }
            else{
                res.send({logoutStatus: false});
            }
        })

        expressServer.post(studentID + '/contents', async (req, res) => { // post request to create new post, req needs to be JSON object with required post data
            const poster = new ObjectId(req.body.poster);
            const post = new Post(poster, req.body.text); // create post object
            const result = await postController.newPost(postCollection, post); // pushes post to database

            if(result === 200){
                res.send({postStatus: true});
            }
            else{
                res.send({postStatus: false,
                    ErrorMessage : result
                });
            }
        })

        expressServer.get(studentID + '/contents', async (req, res) => { // get request to get all posts of people followed by user, must be logged in
            try{
            const user = await userCollection.findOne({email : req.session.email}); // gets user object
            console.log(user);
            
            const following = user.following; // gets user's following list
            const posts = await postController.getPosts(postCollection, following); // gets all posts of people followed by user

            res.send(posts); // sends posts back to client
            }
            catch(err){
                console.log(err);
            }

        })

        expressServer.post(studentID + '/follow', async (req, res) => { // post request to follow user, req needs to be JSON object with required follow data, must be logged in
            try{
                let user = req.session.email;
                user = await userCollection.findOne({email : user});
                const userId = user._id;
                const followId = new ObjectId(req.body.followId);

                const result = await userController.followUser(userCollection, userId, followId); // follows user
                res.send(result);
            }
            catch(err){
                console.log(err);
            }
        })

        expressServer.delete(studentID + '/follow', async (req, res) => { // delete request to unfollow user, req needs to be JSON object with required follow data, must be logged in
            try{
                let user = req.session.email;
                user = await userCollection.findOne({email : user});
                const userId = user._id;
                const followId = new ObjectId(req.body.followId);

                const result = userController.unfollowUser(userCollection, userId, followId); // unfollows user
            }
            catch(err){
                console.log(err);
            }
        })

        expressServer.get(studentID + '/users/search', async (req, res) => { // get request to search for user, search term is passed by query 
            try{
                const query = req.query.q; // gets query q from search

                const result = await userController.searchUser(userCollection, query.trim());
                
                res.send(result);

            }catch(err){
                console.log(err);
            }
        })

        expressServer.get(studentID + '/contents/search', async (req, res) => { // get request to search for post, search term is passed by query
            try{
                const query = req.query.q; // gets query q from search

                const result = await postController.searchPost(postCollection, query.trim());
                
                res.send(result);

            }catch(err){
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
        



        console.log("requests initialised\n");
        
    }
    catch(err){
        console.log(err);
    }
    
}





export { startService }; // export function to start service



