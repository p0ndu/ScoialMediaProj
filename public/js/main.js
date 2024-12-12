// import { User} from '../../serverAPI/userFiles/User';

// import * as UserController from "../../serverAPI/userFiles/userController.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const searchBtn = document.getElementById('search-btn');
  const contentSection = document.getElementById('content-section');
  const postsContainer = document.getElementById('posts-container');
  const studentID = '/M00946088'; // Set studentID here for reuse across endpoints
  const userCache = {}; // Cache to reduce repeated API calls
  let isLoggedIn = false;
  let loggedInUserId = null;

  async function checkLoginStatus() {
    try {
      const response = await fetch(studentID + '/login');
      const result = await response.json();
      
      if (result.isLoggedIn) {
        isLoggedIn = true;
        loginBtn.innerText = 'Logout';
      } else {
        isLoggedIn = false;
        loginBtn.innerText = 'Login';
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }

  checkLoginStatus(); // calls checkLoginStatus on load

  // Open modal
  document.getElementById('signup-btn').addEventListener('click', () => {
    document.getElementById('signup-modal').classList.add('active');
  });

  document.getElementById('login-btn').addEventListener('click', async () => {
    if (isLoggedIn) {
      // Handle logout directly
      try {
        const response = await fetch(studentID + '/login', {
          method: 'DELETE',
        });
  
        if (response.ok) {
          alert('Logout successful');
          isLoggedIn = false;
          loginBtn.innerText = 'Login';
          console.log('User logged out:', isLoggedIn);
        } else {
          alert('Logout failed');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout.');
      }
    } else {
      // Open login modal only when logging in
      if (!isLoggedIn) {
        document.getElementById('login-modal').classList.add('active');
      }
    }
  });
  

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }


  // Handle Sign Up Form Submission
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const name = document.getElementById('signup-name').value.trim();
    const age = document.getElementById('signup-age').value.trim();
    const phoneNumber = document.getElementById('signup-phoneNumber').value.trim();

    try {
      const response = await fetch(`${studentID}/users`, { // sends user object to API endpoint to create new user
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, name, age, phoneNumber }) // cant import user here for some reason, it just doesnt like it and i dont have time to figure out why
      });

      if (response.ok) {
        alert('Sign up successful!');
        closeModal('signup-modal');
      } else {
        alert('Sign up failed!');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      alert('An error occurred during sign up.');
    }
  });

  // Handle Login Form Submission
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        if (!email || !password) {
            alert('Both email and password are required.');
            return;
        }

        const response = await fetch(studentID + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json(); // Parse the response body
            if (data.loginStatus) {
                alert('Login successful');
                isLoggedIn = true;
                loggedInUserId = data.userId; // Correctly assign the userId
                console.log('User logged in:', isLoggedIn, 'userid:', loggedInUserId);

                loginBtn.innerText = 'Logout';
                closeModal('login-modal');

                fetchPosts();
                console.log(isLoggedIn); // for debugging
            } else {
                alert('Login failed');
            }
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
});


  // post related functions
  // Fetch Posts from Followed Users and All Posts
  async function fetchPosts() {
    try {
      const postsContainer = document.getElementById('posts-container');
      const uniqueAllPosts = []; // stores unique posts by users not followed, without duplicates of ones by followed users

      // Fetch posts by followed users
      const followedResponse = await fetch('/M00946088/contents/followed');
      const followedPosts = await followedResponse.json();

      // Fetch all posts
      const allPostsResponse = await fetch('/M00946088/contents');
      const allPosts = await allPostsResponse.json();

      // filters out posts by followed users from all posts
      for (const post of allPosts) {
        // Check if the post is not in followedPosts
        const isAlreadyFollowed = followedPosts.some(followedPost => followedPost._id === post._id);
        if (!isAlreadyFollowed) {
          uniqueAllPosts.push(post);
        }
      }

      const combinedPosts = [...followedPosts, ...uniqueAllPosts]; // combines posts to a single array

      postsContainer.innerHTML = ''; // clears container

      combinedPosts.forEach(post => renderPost(post)); // renders posts

    } catch (error) {
      console.error('Error fetching posts:', error);
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = 'Failed to load posts. Please try again later.';
    }
  }


  searchBtn.addEventListener('click', async () => { // search
    const query = document.getElementById('search-query').value.trim();
    if (!query) {
      alert("Please enter a search query.");
      return;
    }

    try {
      const userResponse = await fetch(`${studentID}/users/search?q=${query}`);
      const users = await userResponse.json();

      const postResponse = await fetch(`${studentID}/contents/search?q=${query}`);
      const posts = await postResponse.json();

      postsContainer.innerHTML = ''; // clear previous results

      if (users.length > 0) {
        users.forEach(user => {
          renderUser(user);
        });
      }

      if (posts.length > 0) {
        posts.forEach(post => {
          console.log(post.poster, " before resolving");
          
          const poster = resolveUser(post.poster);
          console.log(poster, " after resolving");

          
          renderPost(post, poster);
        });
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("Error occurred during search.");
    }
  });

  async function resolveUser(posterId) {
    if (userCache[posterId]) { // if already cached just return

      return userCache[posterId];
      console.log("already cached, Cached user:", userCache[posterId]);
      
    }

    try {
      const response = await fetch(`${studentID}/users/getUserById?userId=${posterId}`);
      const result = response.clone();
      console.log("Response: ", result.json());

      // console.log("Response as text: ", result.text());
      
      

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const user = await response.json();
      userCache[posterId] = user; // cache the resolved user object
      console.log("Resolved user:" , user);
      

      return user;

    } catch (error) {
      console.error("Error fetching user:", error);
      return { username: "Unknown", profilePicUrl: "" };
    }
  }



  function renderUser(user) { // html to render user, would really want this in a separate file but times getting low so all of the html and css for it is just staying here, a lot of it is just inline styling with HEAVY inspiration from various social media sites
    const userDiv = document.createElement('div');
    userDiv.style.border = '1px solid #ddd';
    userDiv.style.borderRadius = '8px';
    userDiv.style.margin = '10px 0';
    userDiv.style.padding = '10px';
    userDiv.style.display = 'flex';
    userDiv.style.alignItems = 'center';
    userDiv.style.backgroundColor = '#f9f9f9';

    const profilePic = document.createElement('div');
    profilePic.innerText = user.username.charAt(0).toUpperCase();
    profilePic.style.width = '40px';
    profilePic.style.height = '40px';
    profilePic.style.borderRadius = '50%';
    profilePic.style.backgroundColor = '#007bff';
    profilePic.style.color = '#fff';
    profilePic.style.display = 'flex';
    profilePic.style.justifyContent = 'center';
    profilePic.style.alignItems = 'center';
    profilePic.style.fontSize = '18px';
    profilePic.style.marginRight = '10px';

    const username = document.createElement('span');
    username.innerText = user.username;
    username.style.fontWeight = 'bold';
    username.style.fontSize = '16px';

    userDiv.appendChild(profilePic);
    userDiv.appendChild(username);

    postsContainer.appendChild(userDiv);
  }


  async function renderPost(post) {
    if (!post || !post.poster || !post.text) {
      console.warn("Skipping invalid post:", post);
      return;
    }
  
    const user = await resolveUser(post.poster);
    
    console.log(post.poster + " - poster");
    console.log("Resolved user:", user);
  
    const postDiv = document.createElement('div');
    postDiv.style.border = '1px solid #ddd';
    postDiv.style.borderRadius = '8px';
    postDiv.style.margin = '10px 0';
    postDiv.style.padding = '10px';
    postDiv.style.display = 'flex';
    postDiv.style.flexDirection = 'column';
    postDiv.style.backgroundColor = '#f9f9f9';
  
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
  
    const profilePic = document.createElement('div');
    profilePic.innerText = user.username ? user.username.charAt(0).toUpperCase() : '?';
    profilePic.style.width = '40px';
    profilePic.style.height = '40px';
    profilePic.style.borderRadius = '50%';
    profilePic.style.backgroundColor = '#007bff';
    profilePic.style.color = '#fff';
    profilePic.style.display = 'flex';
    profilePic.style.justifyContent = 'center';
    profilePic.style.alignItems = 'center';
    profilePic.style.fontSize = '18px';
    profilePic.style.marginRight = '10px';
  
    const userSpan = document.createElement('span');
    userSpan.innerText = user.username || "Unknown";
  
    headerDiv.appendChild(profilePic);
    headerDiv.appendChild(userSpan);
  
    const contentDiv = document.createElement('div');
    contentDiv.innerText = post.text;
    contentDiv.style.marginTop = '10px';
    contentDiv.style.fontSize = '14px';
    contentDiv.style.color = '#333';
  
    // container to hold buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.style.marginTop = '10px';
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
  
    // like button styling and function
    const likeButton = document.createElement('button');
    likeButton.innerText = post.isLiked ? 'Unlike' : 'Like';
    likeButton.style.padding = '5px 10px';
    likeButton.style.border = '1px solid #007bff';
    likeButton.style.borderRadius = '4px';
    likeButton.style.backgroundColor = post.isLiked ? '#007bff' : '#fff';
    likeButton.style.color = post.isLiked ? '#fff' : '#007bff';
    likeButton.style.cursor = 'pointer';

    likeButton.onclick = async () => {
      post.isLiked = !post.isLiked; // toggles between the two states
      likeButton.innerText = post.isLiked ? 'Unlike' : 'Like';
      likeButton.style.backgroundColor = post.isLiked ? '#007bff' : '#fff';
      likeButton.style.color = post.isLiked ? '#fff' : '#007bff';

      await toggleLike(post._id, loggedInUserId); // calls like function passing the post id 
    };
  
    // follow button stylig and function
    const followButton = document.createElement('button');
    followButton.innerText = user.isFollowed ? 'Unfollow' : 'Follow';

    followButton.style.padding = '5px 10px';
    followButton.style.border = '1px solid #28a745';
    followButton.style.borderRadius = '4px';
    followButton.style.backgroundColor = user.isFollowed ? '#28a745' : '#fff'; // toggles between two colours
    followButton.style.color = user.isFollowed ? '#fff' : '#28a745';
    followButton.style.cursor = 'pointer';

    followButton.onclick = async () => {
      user.isFollowed = !user.isFollowed; // toggles between two states
    
      followButton.innerText = user.isFollowed ? 'Unfollow' : 'Follow';
      followButton.style.backgroundColor = user.isFollowed ? '#28a745' : '#fff'; // toggles between two colours
      followButton.style.color = user.isFollowed ? '#fff' : '#28a745';

      await toggleFollow(post.poster); // calls follow function passing the user id
    };
  
    // Block button
    const blockButton = document.createElement('button');
    blockButton.innerText = user.isBlocked ? 'Unblock' : 'Block';
    blockButton.style.padding = '5px 10px';
    blockButton.style.border = '1px solid #dc3545';
    blockButton.style.borderRadius = '4px';
    blockButton.style.backgroundColor = user.isBlocked ? '#dc3545' : '#fff';
    blockButton.style.color = user.isBlocked ? '#fff' : '#dc3545';
    blockButton.style.cursor = 'pointer';

    blockButton.onclick = async () => {
      user.isBlocked = !user.isBlocked; // toggles between two states

      blockButton.innerText = user.isBlocked ? 'Unblock' : 'Block';
      blockButton.style.backgroundColor = user.isBlocked ? '#dc3545' : '#fff'; // toggles between two colours
      blockButton.style.color = user.isBlocked ? '#fff' : '#dc3545';

      await toggleBlock(post.poster); // calls block function passing the user id
    };
  
    actionsDiv.appendChild(likeButton);
    actionsDiv.appendChild(followButton);
    actionsDiv.appendChild(blockButton);
  
    postDiv.appendChild(headerDiv);
    postDiv.appendChild(contentDiv);
    postDiv.appendChild(actionsDiv);
  
    postsContainer.appendChild(postDiv);
  }
  
  async function toggleLike(postId, userId) {
    try {

      console.log("Toggling like for postId:", postId, "userId:", userId);
      
      const response = await fetch( // checks if liked
        `${studentID}/posts/isLiked?postId=${postId}&userId=${userId}`
      );
      
      // Parse the server's response
      const parsedResponse = await response.json();
      console.log("Parsed response:", parsedResponse);
      
  
      if (parsedResponse.isLiked) {
        // Logic for "unlike"
        const unlikeResponse = await fetch(
          `${studentID}/contents/unlike`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likeId: postId, userId }),
          }
        );
        console.log("Unlike response:", await unlikeResponse.json());
      } else {
        // Logic for "like"
        const likeResponse = await fetch(
          `${studentID}/posts/like?postId=${postId}&userId=${userId}`,);
        console.log("Like response:", await likeResponse.json());
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }
  
  
  
  async function toggleFollow(followeeId, loggedInUserId) { // follow function, somewhere somehow the post.poster id is changing and i have NO idea why or where so whatever idc anymore
    
    try {
      const response = await fetch(
        `${studentID}/isFollowing?followerId=${loggedInUserId}&followeeId=${followeeId}`
      );
      const parsedResponse = await response.json();
  
      if (parsedResponse.isFollowing) { // unfollow logic
        const unfollowResponse = await fetch(
          `${studentID}/unfollow`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followId: followeeId }),
          }
        );
        console.log("Unfollow response:", await unfollowResponse.json());
      } else {
        const followResponse = await fetch( // follow logic
          `${studentID}/follow`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followId: followeeId }),
          }
        );
        console.log("Follow response:", await followResponse.json());
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  }
  
  
  
  
  async function toggleBlock(userId, loggedInUserId) {
    try {
      console.log("Toggling block for userId:", userId ,' from user:', loggedInUserId);
  
      const response = await fetch(
        `${studentID}/users/block?userId=${userId}&loggedInUserId=${loggedInUserId}`);
  
      const parsedResponse = await response.json();
      console.log("Block response:", parsedResponse);
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  }
  

  function isValidEmail(email) { // email input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regex from stack overflow, i dont know regex and am not about to learn it
    return emailRegex.test(email);
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  



});
