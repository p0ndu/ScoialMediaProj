// import { User} from '../../serverAPI/userFiles/User';

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const searchBtn = document.getElementById('search-btn');
  const contentSection = document.getElementById('content-section');
  const postsContainer = document.getElementById('posts-container');
  const studentID = '/M00946088'; // Set studentID here for reuse across endpoints
  const userCache = {}; // Cache to reduce repeated API calls

  // Open modal
  document.getElementById('signup-btn').addEventListener('click', () => {
    document.getElementById('signup-modal').classList.add('active');
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('login-modal').classList.add('active');
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
      if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        const response = await fetch('/M00946088/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          alert('Login successful!');
          closeModal('login-modal');
          fetchPosts(); // Load posts after logging in
        } else {
          alert('Login failed!');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
      }
    }
    catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login.');
    }
  });

  // Fetch posts after login
  // Fetch Posts from Followed Users and All Posts
  async function fetchPosts() {
    try {
      // Fetch posts by followed users
      const followedResponse = await fetch('/M00946088/contents');
      const followedPosts = await followedResponse.json();

      // Fetch all posts
      const allPostsResponse = await fetch('/M00946088/contents/all');
      const allPosts = await allPostsResponse.json();

      // Filter out posts already fetched from followed users
      // Initialize an array to store unique posts
      const uniqueAllPosts = [];

      // Iterate through allPosts
      for (const post of allPosts) {
        // Check if the post is not in followedPosts
        const isAlreadyFollowed = followedPosts.some(followedPost => followedPost._id === post._id);
        if (!isAlreadyFollowed) {
          uniqueAllPosts.push(post);
        }
      }


      // Combine followed posts and other posts
      const combinedPosts = [...followedPosts, ...uniqueAllPosts];

      // Clear the posts container
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = '';

      // Render all posts
      combinedPosts.forEach(post => renderPost(post));
    } catch (error) {
      console.error('Error fetching posts:', error);
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = 'Failed to load posts. Please try again later.';
    }
  }


  // Handle Search
  searchBtn.addEventListener('click', async () => {
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

      postsContainer.innerHTML = ''; // Clear previous results

      if (users.length > 0) {
        users.forEach(user => {
          renderUser(user);
        });
      }

      if (posts.length > 0) {
        posts.forEach(post => {
          const poster = resolveUser(post.poster);
          renderPost(post, poster);
        });
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("Error occurred during search.");
    }
  });

  async function resolveUser(posterId) {
    if (userCache[posterId]) {
      return userCache[posterId]; // Return cached user data
    }

    try {
      const response = await fetch(`${studentID}/users/getUserById?userId=${posterId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const user = await response.json();
      userCache[posterId] = user; // Cache the resolved user object
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return { username: "Unknown", profilePicUrl: "" };
    }
  }


  // Helper function for rendering users
  function renderUser(user) {
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

  // Helper function for rendering posts
  async function renderPost(post) {
    if (!post || !post.poster || !post.text) {
      console.warn("Skipping invalid post:", post);
      return;
    }

    const user = await resolveUser(post.poster);

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

    postDiv.appendChild(headerDiv);
    postDiv.appendChild(contentDiv);

    postsContainer.appendChild(postDiv);
  }

  // Helper function to validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex to validate email format
    return emailRegex.test(email);
  }







});
