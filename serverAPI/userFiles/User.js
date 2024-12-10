class User { // user class to create users to add to database, no real need for member functions as everything is handled by userController or the database so why store or work on them locally
    username;
    password;
    email;
    name;
    phoneNumber;
    age;
    posts;
    blockedUsers;;
    following;;
    followers;
    
    constructor(username, password, email, name, phoneNumber, age) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.age = age;
        this.posts = [];
        this.blockedUsers = [];
        this.following = [];
        this.followers = [];
    }
}



export default User;