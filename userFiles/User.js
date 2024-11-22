class User { // user class to create users to add to database, no real need for member functions as everything is handled by userController or the database so why store or work on them locally
    constructor(username, password, name, phoneNumber, age) {
        this.username = username;
        this.password = password;
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

