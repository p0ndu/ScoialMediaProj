import express from 'express'; // importing dependencies
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion} from 'mongodb';
import dotenv from 'dotenv';

// setup for express web service

const expressServer = express(); // create express server object
expressServer.use(bodyParser.json()); // use body parser to parse json
expressServer.use(express.static('public')); // serve static files from public folder
expressServer.use(expressSession({
    secret: "secString",
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: true
}))
expressServer.listen(8080); // listen on port 8080
console.log("Express setup (listening on port 8080)");

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

console.log("attempting to connect to mongoDB atlas");
try{
    await client.connect();
    console.log("connected to mongoDB atlas");
}catch(e){
    console.log("error connecting to mongoDB atlas");
    console.log(e);
    client.close();
}
