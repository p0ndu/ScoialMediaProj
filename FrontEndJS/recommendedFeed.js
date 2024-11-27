 // TODO, add function to dynamically suggest friends

 function populateFeed(container, recommendedUsers){
    const container = document.getElementById(container);

    recommendedUsers.array.forEach(element => { // convert this to an external function, idk why its here
        const suggestionDiv = container.createElement('div'); // adds div for eadh suggested 
        suggestionDiv.className = "suggestion";

        suggestionDiv.innerHTML = `
            <img src="${user.profilePic}" alt="${user.username} Profile">
            <span>${user.username}</span>
            <button>Follow</button>
        `;

    });

 }