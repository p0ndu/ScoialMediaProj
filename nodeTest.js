import express from 'express'; // importing dependencies
import bodyParser from 'body-parser';
import expressSession from 'express-session';


const server = express(); // create express server object
server.use(bodyParser.json()); // use body parser to parse json
server.use(express.static('public')); // serve static files from public folder
server.use(expressSession({
    secret: "secString",
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: true
}))

const catArray = []; // create an empty array to store cats

server.post('/cat', (req, res) => {
    catArray.push(req.body);

    res.send({"name" : "data reieved"});
})

server.get('/cat', (req,res) => {
    res.send(JSON.stringify(catArray));
})

server.get('/cat/search', (req,res) => {
    if (req.query.name === undefined) {
        res.send({"error" : "no name provided"});
    }
    else{
        const catsFound = [];
        for (let cat of catArray){
            if (cat.name === req.query.name){
                catsFound.push(cat);
            }
        }

        res.send(JSON.stringify(catsFound));
    }
})

server.listen(8080); // listen on port 8080
console.log("listening on port 8080");
