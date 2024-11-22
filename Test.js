// test file, remove when done

import express from 'express'; // importing dependencies
import bodyParser from 'body-parser';
import expressSession from 'express-session';

//mongodb+srv://<username>:<password>@<server>?retryWrites=true&w=majority

// demo for webService 


// const server = express(); // create express server object
// server.use(bodyParser.json()); // use body parser to parse json
// server.use(express.static('public')); // serve static files from public folder
// server.use(expressSession({
//     secret: "secString",
//     cookie: {maxAge: 60000},
//     resave: false,
//     saveUninitialized: true
// }))

// const catArray = []; // create an empty array to store cats

// server.post('/cat', (req, res) => {
//     catArray.push(req.body);

//     res.send({"name" : "data reieved"});
// })

// server.get('/cat', (req,res) => {
//     res.send(JSON.stringify(catArray));
// })

// server.get('/cat/search', (req,res) => {
//     if (req.query.name === undefined) {
//         res.send({"error" : "no name provided"});
//     }
//     else{
//         const catsFound = [];
//         for (let cat of catArray){
//             if (cat.name === req.query.name){
//                 catsFound.push(cat);
//             }
//         }

//         res.send(JSON.stringify(catsFound));
//     }
// })

// server.listen(8080); // listen on port 8080
// console.log("listening on port 8080");


// demo for connecting to mongoDB atlas

//import classes from mongodb module
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const username = process.env.dbUsername;
const password = process.env.dbPassword;
const server = process.env.server;
const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false, // needs to stay as false in order to index search according to lecutre video
        deprecationErrors: true
    }
});
const encodedUsername = encodeURIComponent(username);
const encodedPassword = encodeURIComponent(password);
const database = client.db(process.env.dbName);
const userCollection = database.collection('users');
const connectionURI = `mongodb+srv://${encodedUsername}:${encodedPassword}${server}?retryWrites=true&w=majority`;
// console.log(connectionURI);



async function findSort(options) { // takes options as JSO 
    const query = {}; // returns all documents

    const results = await collection.find(query, options).toArray();

    return results;
}

async function find() {
    const query = {};

    const results = collection.find(query).toArray();

     return results;
}

async function newUser(user) {
    const result = collection.insertOne(user);

    return result;
}








try {
    client.connect();
    console.log("connected to MongoDB\n");
}
catch (e) {
    console.log("error: ", e);
}
console.log(await newUser({username: "Antoine", password: "Antoine1", age: 33,phoneNumber: "07433888312"}));
console.log(await find());
await client.close();