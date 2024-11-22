import express from 'express'; // importing external dependencies
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

import { followUser, unfollowUser, newUser, deleteUser, changePassword, changeEmail, changePhoneNumber, changeUsername, blockUser, unblockUser  } from './userFiles/userController.js'; // importing classes and functions
import User from './userFiles/User.js';

// setup for express web service

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
try {
    await client.connect();
    console.log("connected to mongoDB atlas");
} catch (e) {
    console.log("error connecting to mongoDB atlas");
    console.log(e);
    client.close();
}

// fake users as testing data
// const testDataArray = [
//     {
//         "username": "alice_in_wonder",
//         "password": "Alice@2023",
//         "name": "Alice Johnson",
//         "phoneNumber": "07123456701",
//         "age": 25,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "bobby_builder",
//         "password": "Bob@Secure1",
//         "name": "Bob Smith",
//         "phoneNumber": "07234567802",
//         "age": 30,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "cat_lover_lee",
//         "password": "CathyLee2023",
//         "name": "Cathy Lee",
//         "phoneNumber": "07345678903",
//         "age": 22,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "david_the_bold",
//         "password": "David123!",
//         "name": "David Brown",
//         "phoneNumber": "07456789004",
//         "age": 27,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "ella_shines",
//         "password": "Ella2023!",
//         "name": "Ella White",
//         "phoneNumber": "07567890105",
//         "age": 24,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "frankie_moves",
//         "password": "Frankie_456",
//         "name": "Frank Harris",
//         "phoneNumber": "07678901206",
//         "age": 28,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "george_rides",
//         "password": "GeorgeKing99",
//         "name": "George King",
//         "phoneNumber": "07789012307",
//         "age": 29,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "davis_dreamer",
//         "password": "Hannah@2023",
//         "name": "Hannah Davis",
//         "phoneNumber": "07890123408",
//         "age": 26,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "ian_on_fire",
//         "password": "IanMiller12",
//         "name": "Ian Miller",
//         "phoneNumber": "07901234509",
//         "age": 31,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "julia_globetrotter",
//         "password": "Julia#2023",
//         "name": "Julia Sanders",
//         "phoneNumber": "07012345610",
//         "age": 23,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "karen_cooks",
//         "password": "KarenC123!",
//         "name": "Karen Cook",
//         "phoneNumber": "07112345611",
//         "age": 35,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "luke_skywalker90",
//         "password": "LukeSky90",
//         "name": "Luke Walker",
//         "phoneNumber": "07223456712",
//         "age": 34,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "mia_melodic",
//         "password": "MelodicMia@2023",
//         "name": "Mia Green",
//         "phoneNumber": "07334567813",
//         "age": 21,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "noah_the_nerd",
//         "password": "NoahNerdy#1",
//         "name": "Noah Adams",
//         "phoneNumber": "07445678914",
//         "age": 29,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "olivia_artsy",
//         "password": "ArtByOlivia2023",
//         "name": "Olivia Brooks",
//         "phoneNumber": "07556789015",
//         "age": 24,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "peter_pixel",
//         "password": "PeterP123!",
//         "name": "Peter Hayes",
//         "phoneNumber": "07667890116",
//         "age": 32,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "queen_b_quinn",
//         "password": "QueenBee123!",
//         "name": "Quinn Reed",
//         "phoneNumber": "07778901217",
//         "age": 26,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "ryan_rider",
//         "password": "RyanRides456",
//         "name": "Ryan Scott",
//         "phoneNumber": "07889012318",
//         "age": 28,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "sophie_scribe",
//         "password": "SophieWrites@2023",
//         "name": "Sophie Turner",
//         "phoneNumber": "07990123419",
//         "age": 27,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "theo_traveler",
//         "password": "TheoWorld@90",
//         "name": "Theo Brooks",
//         "phoneNumber": "07011234520",
//         "age": 30,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "uma_unique",
//         "password": "Uma2023!",
//         "name": "Uma Clark",
//         "phoneNumber": "07122345621",
//         "age": 25,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "vince_views",
//         "password": "VinceV123",
//         "name": "Vincent Hill",
//         "phoneNumber": "07233456722",
//         "age": 33,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "winnie_the_wise",
//         "password": "WinnieWise2023",
//         "name": "Winnie Young",
//         "phoneNumber": "07344567823",
//         "age": 35,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "xavier_curious",
//         "password": "Xavier123!",
//         "name": "Xavier Lopez",
//         "phoneNumber": "07455678924",
//         "age": 29,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "yasmin_yogini",
//         "password": "YasminYoga!",
//         "name": "Yasmin Flores",
//         "phoneNumber": "07566789025",
//         "age": 27,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "zane_zesty",
//         "password": "Zane123@!",
//         "name": "Zane Parker",
//         "phoneNumber": "07677890126",
//         "age": 28,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "amelia_adventurer",
//         "password": "AmeliaAdventures",
//         "name": "Amelia Fox",
//         "phoneNumber": "07788901227",
//         "age": 22,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "benjamin_books",
//         "password": "BooksByBen!",
//         "name": "Benjamin Carter",
//         "phoneNumber": "07899012328",
//         "age": 31,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "chloe_creative",
//         "password": "CreativeChloe2023",
//         "name": "Chloe Evans",
//         "phoneNumber": "07910123429",
//         "age": 23,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "dylan_dreambig",
//         "password": "DreamBig2023",
//         "name": "Dylan Ward",
//         "phoneNumber": "07021234530",
//         "age": 34,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "adventure_ash",
//         "password": "AshRocks2023",
//         "name": "Ashley Morgan",
//         "phoneNumber": "07121234501",
//         "age": 28,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "bryce_builds",
//         "password": "BryceB123!",
//         "name": "Bryce Harper",
//         "phoneNumber": "07222345602",
//         "age": 32,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "candace_coder",
//         "password": "CodeWithCandace",
//         "name": "Candace Rivera",
//         "phoneNumber": "07333456703",
//         "age": 24,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "dana_designs",
//         "password": "DanaD123!",
//         "name": "Dana Bell",
//         "phoneNumber": "07444567804",
//         "age": 27,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "emma_enlightened",
//         "password": "LightWithEmma",
//         "name": "Emma Lopez",
//         "phoneNumber": "07555678905",
//         "age": 29,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "fabio_flash",
//         "password": "FabioF2023",
//         "name": "Fabio Sanchez",
//         "phoneNumber": "07666789006",
//         "age": 30,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "grace_grit",
//         "password": "GrittyGrace!",
//         "name": "Grace Martinez",
//         "phoneNumber": "07777890107",
//         "age": 26,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "henry_hustle",
//         "password": "HenryH123!",
//         "name": "Henry Phillips",
//         "phoneNumber": "07888901208",
//         "age": 33,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "ivy_inspired",
//         "password": "IvyInspires2023",
//         "name": "Ivy Torres",
//         "phoneNumber": "07999012309",
//         "age": 23,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "jack_jetset",
//         "password": "JetSetJack",
//         "name": "Jack Palmer",
//         "phoneNumber": "07010123410",
//         "age": 31,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "kelly_kaleidoscope",
//         "password": "KellyKaleido!",
//         "name": "Kelly Hart",
//         "phoneNumber": "07111234511",
//         "age": 25,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "liam_legend",
//         "password": "LiamRocks2023",
//         "name": "Liam Campbell",
//         "phoneNumber": "07222345612",
//         "age": 30,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "mia_magic",
//         "password": "MagicMia@2023",
//         "name": "Mia Flores",
//         "phoneNumber": "07333456713",
//         "age": 21,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "nate_nomad",
//         "password": "NomadicNate",
//         "name": "Nathan Rogers",
//         "phoneNumber": "07444567814",
//         "age": 29,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "oliver_onpoint",
//         "password": "OnPointOliver",
//         "name": "Oliver Hughes",
//         "phoneNumber": "07555678915",
//         "age": 34,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "paige_prism",
//         "password": "PrismaticPaige",
//         "name": "Paige Collins",
//         "phoneNumber": "07666789016",
//         "age": 22,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "quentin_quietstorm",
//         "password": "QuietStormQ",
//         "name": "Quentin Wright",
//         "phoneNumber": "07777890117",
//         "age": 28,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "ruby_renaissance",
//         "password": "RubyRocks123",
//         "name": "Ruby Bennett",
//         "phoneNumber": "07888901218",
//         "age": 27,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "sam_skyline",
//         "password": "SkylineSam",
//         "name": "Samuel Brooks",
//         "phoneNumber": "07999012319",
//         "age": 35,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     },
//     {
//         "username": "tina_tranquil",
//         "password": "TranquilTina@2023",
//         "name": "Tina King",
//         "phoneNumber": "07010123420",
//         "age": 24,
//         "posts": [],
//         "friends": [],
//         "blockedUsers": []
//     }
// ]

// try {
//     await userCollection.insertMany(testDataArray);
//     console.log("inserted test data into database");
// }
// catch (e) {
//     console.log("error inserting test data into database");
//     console.log(e);
// }

// const uID1 = new ObjectId('6740e51528a9b0395e4b50ca');
// const uID2 = new ObjectId('6740e51528a9b0395e4b50c9');
// console.log(
//  await unblockUser(userCollection, uID1, uID2));

// const test = new User("test", "test", "test", "test", 1);








