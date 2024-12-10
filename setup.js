 // importing external dependencies
import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// importing internal dependencies
import * as userController from './serverAPI/userFiles/userController.js';
import User from './ServerAPI/userFiles/User.js';
import * as postController from './serverAPI/postFiles/postController.js';
import Post from './serverAPI/postFiles/Post.js';
import Comment from './serverAPI/postFiles/Comment.js';
import { startService } from './webService/webService.js';


// setup for mongoDB connection

//setting up URI for mongoDB connection from .env file
dotenv.config();
const username = process.env.dbUsername;
const password = process.env.dbPass;
const mongoServer = process.env.server;
const encodedUsername = encodeURIComponent(username);
const encodedPassword = encodeURIComponent(password);
const connectionURI = `mongodb+srv://${encodedUsername}:${encodedPassword}${mongoServer}?retryWrites=true&w=majority`;

//setting up database and collections
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false, // needs to stay as false in order to index search according to lecture video
        deprecationErrors: true
    }
});
const database = client.db(process.env.dbName);
const userCollection = database.collection('users');
const postCollection = database.collection('posts');

console.log("attempting to connect to mongoDB atlas");
try {
    await client.connect();
    console.log("connected to mongoDB atlas");
} catch (e) {
    console.log("error connecting to mongoDB atlas");
    console.log(e);
    client.close();
}

// setup for express web service

startService(userCollection, postCollection);

























