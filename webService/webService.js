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
        expressServer.post('/users', async (req, res) => { // post request to create new user, req needs to be JSON object with required userData
            const user = new User(req.body.username, req.body.password, req.body.email, req.body.name, req.body.phoneNumber, req.body.age); // create user object
            const result = await userController.newUser(userCollection, user); // pushes user to database

            res.send(result); // sends result back to client
        })

        expressServer.get('/login', async (req,res) => { // WIP, get request to check if user is logged in
            const result = await userController.isLoggedIn(req); // checks session to see if user is logged in

            if (result === 200){
                res.send({loginStatus: true});
            }
            else{
                res.send({loginStatus: false});
            }
        })

        expressServer.post('/login', async (req, res) => { // get request to login user, req needs to be JSON object with email and password
            const result = await userController.login(userCollection,req, req.body.email, req.body.password); // logs user in

            if (result === 200){
                res.send({loginStatus: true});
            }
            else{
                res.send({loginStatus: false});
            }
        })

        expressServer.delete('/login', async (req, res) => { // get request to logout user
            const result = await userController.logout(req); // logs user out

            if (result === 200){
                res.send({logoutStatus: true});
            }
            else{
                res.send({logoutStatus: false});
            }
        })

        expressServer.post('/contents', async (req, res) => { // post request to create new post, req needs to be JSON object with required post data
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

        expressServer.get('/contents', async (req, res) => { // get request to get all posts of people followed by user, must be logged in
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

        expressServer.post('/follow', async (req, res) => { // post request to follow user, req needs to be JSON object with required follow data, must be logged in
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

        expressServer.delete('/follow', async (req, res) => { // delete request to unfollow user, req needs to be JSON object with required follow data, must be logged in
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

        expressServer.get('/users/search', async (req, res) => { // get request to search for user, search term is passed by query 
            try{
                const query = req.query.q; // gets query q from search

                const result = await userController.searchUser(userCollection, query.trim());
                
                res.send(result);

            }catch(err){
                console.log(err);
            }
        })

        expressServer.get('/contents/search', async (req, res) => { // get request to search for post, search term is passed by query
            try{
                const query = req.query.q; // gets query q from search

                const result = await postController.searchPost(postCollection, query.trim());
                
                res.send(result);

            }catch(err){
                console.log(err);
            }
        })




    }
    catch(err){
        console.log(err);
    }
    
}





export { startService }; // export function to start service



