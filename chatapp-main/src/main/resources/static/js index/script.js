// MAPPING ELEMENTS
const session_id=getSessionID();
let chat_id_current="";
let client =null;
const conversationFormButtons = {
    emotion: document.querySelector(".conversation-form-button .ri-emotion-line"),
    record: document.querySelector(".conversation-form-record .ri-mic-line"),
    submitMessage: document.querySelector(".conversation-form-submit .ri-send-plane-2-line")
};
const chatLink = document.getElementById("chat-link");
const contactsLink = document.getElementById("contacts-link");
let inputData="";
let newlyCreatedChatId="";

// GET SESSION ID
function getSessionID() {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get('id');
}

//SETTING UP FOR ELEMENT TO LOAD PAGE INCLUDING SESSION ID

chatLink.href = `mainchat.html?id=${session_id}`;
contactsLink.href = `friendlist.html?id=${session_id}`;

//INITIALIZE WEBSOCKET

connectWebSocket()
function connectWebSocket() {
    if (!session_id) {
        console.error('Session ID is not available.');
        return;
    }

    const wsUrl = 'wss://localhost:8443/ws'; // Use 'wss://' for secure WebSocket connection

    client = new StompJs.Client({
        brokerURL: wsUrl,
        connectHeaders: {
            'session-id': session_id,
        },
        debug: function (str) {
            console.log('[DEBUG]', str);
        },
        reconnectDelay: 5000, // Retry connection every 5 seconds if disconnected
        heartbeatIncoming: 4000, // Heartbeat check for incoming messages every 4 seconds
        heartbeatOutgoing: 4000, // Heartbeat check for outgoing messages every 4 seconds
    });

    client.onConnect = function (frame) {
        console.log('Connected to WebSocket server');
        // Optionally, you can subscribe to a topic here
    };

    client.onMessage = function (event) {
        // Ensure chat_id_current is defined
        if (chat_id_current) {
            loadMessages(session_id, chat_id_current); // Handle incoming messages
        } else {
            console.error('chat_id_current is not defined');
        }
    };

    client.onStompError = function (frame) {
        console.error('WebSocket error:', frame.headers['message'], frame.body);
    };

    client.activate();
}


// UI STUFFS

document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function (e) {
    e.preventDefault()
    this.parentElement.classList.toggle('active')
});

document.addEventListener('click', function (e) {
    if (!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
        document.querySelector('.chat-sidebar-profile').classList.remove('active')
    }
})

//SEARCH BAR IN CHAT PAGE

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    // implement the search into this suggestions array
    const suggestions = [
        {text: 'Apple', icon: '🍎'},
        {text: 'Banana', icon: '🍌'},
        {text: 'Cherry', icon: '🍒'},
        {text: 'Date', icon: '🌴'},
        {text: 'Elderberry', icon: '🍇'},
        {text: 'Fig', icon: '🍈'},
        {text: 'Grape', icon: '🍇'},
        {text: 'Honeydew', icon: '🍈'}
    ];

    searchInput.addEventListener('input', function () {
        const query = this.value;
        //fetch search engine inside here
        // For demonstration, we'll use static suggestions.
        // In a real implementation, this would involve making an AJAX request to fetch suggestions.
        const suggestions = [
            'apple',
            'banana',
            'cherry',
            'date',
            'elderberry',
            'fig',
            'grape',
            'honeydew'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));

        // Clear existing suggestions
        while (suggestionsList.firstChild) {
            suggestionsList.removeChild(suggestionsList.firstChild);
        }

        if (suggestions.length > 0) {
            suggestionsList.style.display = 'block';
            suggestions.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                li.addEventListener('click', () => {
                    searchInput.value = item;
                    suggestionsList.style.display = 'none';
                });
                suggestionsList.appendChild(li);
            });
        } else {
            suggestionsList.style.display = 'none';
        }
    });
    //display the search bar
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.content-sidebar-form')) {
            suggestionsList.style.display = 'none';
        }
    });
});

// MESSAGE BUTTON FUNCTION (SHARE,DELETE WHEN CLICK THE MESSAGE)

document.querySelectorAll('.conversation-item-dropdown-toggle').forEach(function (item) {
    item.addEventListener('click', function (e) {
        e.preventDefault()
        if (this.parentElement.classList.contains('active')) {
            this.parentElement.classList.remove('active')
        } else {
            document.querySelectorAll('.conversation-item-dropdown').forEach(function (i) {
                i.classList.remove('active')
            })
            this.parentElement.classList.add('active')
        }
    })
})

document.addEventListener('click', function (e) {
    if (!e.target.matches('.conversation-item-dropdown, .conversation-item-dropdown *')) {
        document.querySelectorAll('.conversation-item-dropdown').forEach(function (i) {
            i.classList.remove('active')
        })
    }
})

//UI STUFFS TO FOCUS ON 1 CHATROOM AT THE SAME TIME

document.querySelectorAll('[data-conversation]').forEach(function (item) {
    item.addEventListener('click', function (e) {
        e.preventDefault()
        document.querySelectorAll('.conversation').forEach(function (i) {
            i.classList.remove('active')
        })
        document.querySelector(this.dataset.conversation).classList.add('active')
    })
})

document.querySelectorAll('.conversation-back').forEach(function (item) {
    item.addEventListener('click', function (e) {
        e.preventDefault()
        this.closest('.conversation').classList.remove('active')
        document.querySelector('.conversation-default').classList.add('active')
    })
})

// Define loadchat globally
function loadchat(session_id, chatId = null) {
    fetch(`/app/${session_id}/loadchat`)
        .then(response => response.json())
        .then(data => {
            const messagesList = document.querySelector(".content-messages-list");

            // Clear existing messages
            messagesList.innerHTML = '';

            data.forEach(chatroomInfo => {
                const listItem = document.createElement("li");
                listItem.classList.add("content-message");

                // Nếu chatId được truyền và khớp, thêm class 'active' để làm sáng
                const isActive = chatId && chatId === chatroomInfo.chat_id;
                if (isActive) {
                    listItem.classList.add("active-chatroom");
                }

                listItem.innerHTML = `
                    <a href="#" data-conversation="${chatroomInfo.chat_id}">
                        <img class="content-message-image" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" alt="">
                        <span class="content-message-info">
                            <span class="content-message-name">${chatroomInfo.name}</span>
                        </span>
                    </a>
                `;


                listItem.addEventListener("click", function (event) {
                    event.preventDefault();
                    const conversationId = this.querySelector("a").getAttribute("data-conversation");

                    // Xóa lớp active trước đó
                    document.querySelectorAll(".content-message").forEach(el => el.classList.remove("active-chatroom"));
                    this.classList.add("active-chatroom");

                    const userDiv = createConversationUser(chatroomInfo.name);
                    document.querySelector(".conversation").prepend(userDiv);
                    newSubscription(conversationId);
                    chat_id_current = conversationId;

                    // Clear old messages
                    const conversationList = document.querySelector(".conversation-list");
                    conversationList.innerHTML = '';

                    loadMessages(session_id, chat_id_current);

                    // Load submit form
                    const formDiv = createSubmitForm();
                    document.querySelector(".conversation").appendChild(formDiv);
                    addChatOption();
                });

                messagesList.appendChild(listItem);

                // Nếu chatId khớp, tự động click để load message
                if (isActive) {
                    listItem.querySelector("a").click();
                }
            });
        })
        .catch(error => console.error('Error:', error));
}



document.addEventListener("DOMContentLoaded", function () {
    loadchat(session_id); // hoặc truyền thêm chatId nếu có
});




function createConversationUser(name) {
    const userDiv = document.getElementsByClassName('conversation-user')[0];
    if (userDiv) {
        userDiv.innerHTML = ''; // Clear existing content
        const userHTML = `
        <div class="conversation-user-name">${name}</div>
    `;
        userDiv.insertAdjacentHTML('beforeend', userHTML);
    } else {
        console.error('No element with class conversation-user found');
    }
    return userDiv;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
	const profileBtn = document.getElementById("profileBtn");

    // Logout functionality
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (!session_id) {
            window.location.href = "/login"; // If no session_id, redirect to login
            return;
        }

        // Call API to delete session
        fetch(`/app/session/${session_id}/delete`, {
            method: "DELETE" // DELETE method to remove session
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to logout");
            localStorage.removeItem("session_id"); // Remove session from localStorage
            window.location.href = "/login"; // Redirect to login page
        })
        .catch(error => {
            console.error("Logout failed:", error);
            alert("Error logging out. Try again."); // Show error message if logout fails
        });
    });

    // Profile button functionality
    profileBtn.addEventListener("click", () => {
        window.location.href = "/profile"; // Redirect to the profile page
    });
});


function createSubmitForm() {
    const conversationDiv = document.getElementsByClassName('conversation-form')[0];
    conversationDiv.innerHTML = '';
    const conversationHTML = `
        <button type="button" class="conversation-form-button"><i class="ri-emotion-line"></i></button>
        <div class="conversation-form-group">
            <textarea class="conversation-form-input" rows="1" placeholder="Type here..."></textarea>
            <button type="button" class="conversation-form-record"><i class="ri-mic-line"></i></button>
        </div>
        <button type="button" id="submitButton" class="conversation-form-button conversation-form-submit"><i class="ri-send-plane-2-line"></i></button>
    `;
    conversationDiv.insertAdjacentHTML('beforeend', conversationHTML);

    const submitButton = conversationDiv.querySelector('#submitButton');
    //SEND MESSAGE BUTTON EXECUTION
    submitButton.addEventListener('click', (event) => {
        const inputData = conversationDiv.querySelector('.conversation-form-input').value;
        console.log(inputData);
        console.log(chat_id_current)
        sendMessage(session_id, chat_id_current, inputData, new Date());
        loadMessages(session_id, chat_id_current);
        inputData.value="";
    });

    return conversationDiv;
}

// WS MESSAGE FUNCTION

let subscription = null; // Variable to hold the subscription object

// Function to subscribe to a chat
function newSubscription(chat_id) {
    console.log("Subscribed to chat");
    subscription = client.subscribe(`/topic/${chat_id}`, function (message) {
        loadMessages(session_id, chat_id); // Handle incoming messages
    });
}

// Function to send a message to a chat
function sendMessage(session_id, chat_id, message, timestamp, type = 'TEXT') {
    client.publish({
        destination: `/app/${session_id}/${chat_id}/sendm`,
        body: JSON.stringify({
            session_id: session_id,
            chat_id: chat_id,
            message: message,
            type: type,
            timestamp: timestamp
        }),
    });
}

// Function to unsubscribe from a chat
function unsubscribe(chat_id) {
    if (subscription) {
        subscription.unsubscribe(); // Unsubscribe using the subscription object
        console.log(`Unsubscribed from chat ${chat_id}`);
    } else {
        console.log(`No active subscription for chat ${chat_id}`);
    }
}


// MESSAGE DATA

document.querySelectorAll('.conversation-form-input').forEach(function (item) {
    item.addEventListener('input', function () {
        this.rows = this.value.split('\n').length;
        inputData=this.value
    })
})

// CREATE CHATROOM POPUP

document.addEventListener('DOMContentLoaded', (event) => {
    const createChatButton = document.querySelector('.create-chat');
    const popup = document.getElementById('popup');
    const closeButton = document.querySelector('.close-button');
    const popupSearchInput = document.getElementById('popupSearchInput');
    const popupSearchResults = document.getElementById('popupSearchResults');
    const selectedItems = document.getElementById('selectedItems');
    const groupNameInput = document.getElementById('groupName');
    const createGroupBtn = document.querySelector('.create-group-btn');

    let selectedUserIds = [];

    // Function to show the popup
    function showPopup() {
        popup.style.display = 'block';
    }

    // Function to close the popup
    function closePopup() {
        popup.style.display = 'none';
    }

    // Event listener for the create chat button
    createChatButton.addEventListener('click', showPopup);

    // Event listener for the close button
    closeButton.addEventListener('click', closePopup);

    // Event listener for closing the popup when clicking outside
    window.onclick = function(event) {
        if (event.target == popup) {
            popup.style.display = "none";
        }
    }

    popupSearchInput.onkeyup = function() {
        const filter = popupSearchInput.value;

        fetch(`/app/${session_id}/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ info: filter })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch users');
                }
            })
            .then(data => {
                popupSearchResults.innerHTML = "";
                const filteredData = data.filter(item => item.name.toLowerCase().includes(filter));
                filteredData.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = item.name;
                    li.onclick = () => addItem(item);
                    popupSearchResults.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                popupSearchResults.innerHTML = "<li>Failed to fetch users</li>";
            });
    }

	function addItem(item) {
	    selectedUserIds.push(item.user_id);
	    const li = document.createElement("li");
	    li.textContent = item.name;
	    li.onclick = function() {
	        selectedItems.removeChild(li);
	        selectedUserIds = selectedUserIds.filter(id => id !== item.user_id);
	    };
	    selectedItems.appendChild(li);
	}

	if (!createGroupBtn._listenerAttached) {
	    createGroupBtn.onclick = function() {
	        console.log("Button clicked");

	        const groupName = groupNameInput.value;
	        const newGroup = {
	            name: groupName,
	            session_id: session_id
	        };

	        fetch(`/app/${session_id}/createChatroom`, {
	            method: 'POST',
	            headers: {
	                'Content-Type': 'application/json'
	            },
	            body: JSON.stringify(newGroup)
	        })
	        .then(response => {
	            if (response.ok) {
	                console.log("Chatroom created successfully");
	                loadchat(session_id);  // load lại danh sách chat
	                return response.text();  // chatId trả về dạng text
	            } else {
	                throw new Error('Failed to create chatroom');
	            }
	        })
	        .then(chatId => {
	            // Lấy tên từng user theo userId trong selectedUserIds
	            return Promise.all(
	                selectedUserIds.map(userId =>
	                    fetch(`/app/user/${userId}/name`)
	                    .then(response => {
	                        if (response.ok) return response.text();
	                        else return "Unknown";
	                    })
	                    .catch(() => "Unknown")
	                )
	            )
	            .then(userNames => {
	                alert(`Nhóm đã tạo với tên: ${groupName} và các thành viên: ${userNames.join(", ")}`);

	                // Ẩn popup, reset UI
	                popup.style.display = "none";
	                selectedItems.innerHTML = "";
	                groupNameInput.value = "";

	                // Thêm user vào chatroom
	                selectedUserIds.forEach(userId => {
	                    fetch(`/app/${session_id}/${chatId}/${userId}/add`, {
	                        method: 'GET'  // tốt hơn dùng POST nếu có thể
	                    })
	                    .then(response => {
	                        if (response.ok) {
	                            console.log(`User ${userId} added to chat ${chatId}`);
	                        } else {
	                            throw new Error(`Failed to add user ${userId} to chat ${chatId}`);
	                        }
	                    })
	                    .catch(error => {
	                        console.error('Error:', error);
	                    });
	                });

	                selectedUserIds = [];
	            });
	        })
	        .catch(error => {
	            console.error('Error:', error);
	            alert("Failed to create chatroom");
	        });
	    };

	    createGroupBtn._listenerAttached = true;
	}
	})


	async function loadMessages(session_id, chat_id) {
	    console.log('fetching data ' + session_id + ' ' + chat_id);

	    try {
	        const response = await fetch(`/app/${session_id}/${chat_id}/loadm`);
	        if (!response.ok) {
	            console.error('❌ Failed to fetch messages: HTTP ' + response.status);
	            return;
	        }

	        const responseData = await response.json();
	        console.log('📩 Received messages:', responseData.messages);

	        const chatGrid = document.getElementById('chat-content-fetch');
	        if (!chatGrid) {
	            console.error("❌ Element with id 'chat-content-fetch' not found in DOM.");
	            return;
	        }

	        chatGrid.innerHTML = '';

	        responseData.messages.forEach(message => {
                let chatHTML = '';
                // Nếu message là file dạng "url|filename"
                if ((message.type === 'FILE' || message.message.includes('|'))) {
                    let fileUrl = message.message;
                    let fileName = "";
                    if (fileUrl.includes('|')) {
                        const parts = fileUrl.split('|');
                        fileUrl = parts[0];
                        fileName = parts[1];
                    }
                    chatHTML = `
                        <li class="conversation-item ${message.sentBySession ? '' : 'me'}">
                            <div class="conversation-item-content">
                                <div class="conversation-item-box">
                                    <div class="conversation-item-text">
                                        <p><strong>${escapeHtml(message.name)}:</strong>
                                        <a href="${fileUrl}" target="_blank" style="color:#5f5fff; text-decoration:underline;">${fileName}</a></p>
                                        <div class="conversation-item-time">${message.time}</div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `;

                } else {
                    // Tin nhắn text bình thường
                    chatHTML = `
                        <li class="conversation-item ${message.sentBySession ? '' : 'me'}">
                            <div class="conversation-item-content">
                                <div class="conversation-item-box">
                                    <div class="conversation-item-text">
                                        <p>${escapeHtml(message.name)}: ${escapeHtml(message.message)}</p>
                                        <div class="conversation-item-time">${message.time}</div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `;
                }
                chatGrid.insertAdjacentHTML('beforeend', chatHTML);
            });




	        // Cuộn xuống tin nhắn mới nhất
	        chatGrid.scrollTop = chatGrid.scrollHeight;

	    } catch (error) {
	        console.error('💥 Error fetching messages:', error);
	    }
	}


// Chat option
document.addEventListener('DOMContentLoaded', () => {
    addChatOption();
});

function addChatOption() {
    const chatOption = document.getElementById('conversation-option');
    chatOption.innerHTML = '';

    const buttonHTML = `
        <button class="menu-btn-chat" id="menuBtn-chat">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </button>

        <div class="popup-chat" id="popup-chat">
            <ul>
                <li onclick="showChangeChatName()">Change Chat Name</li>
                <li onclick="showKickFromChat()">User in chat</li>
                <li onclick="showDeleteChat()">Delete Chat</li>
                <li onclick="showAddToChat()">Add to Chat</li>
                <li onclick="showUploadFile()">Upload File</li>
            </ul>
        </div>

        <!-- Popups for each action -->
        <div class="action-popup-chat" id="changeChatNamePopup-chat">
            <h3>Change Chat Name</h3>
            <form id="changeChatNameForm-chat">
                <input type="text" id="newChatName" placeholder="New Chat Name">
                <button type="submit">Submit</button>
            </form>
        </div>

        <div class="action-popup-chat" id="kickFromChatPopup-chat">
            <h3>User in chat:</h3>
            <form id="kickFromChatForm-chat"></form>
            <h3>Select user to kick</h3>
        </div>

        <div class="action-popup-chat" id="deleteChatPopup-chat">
            <h3>Are you sure?</h3>
            <button onclick="deleteChat()">Yes</button>
            <button onclick="closePopup('deleteChatPopup-chat')">No</button>
        </div>

        <div class="action-popup-chat" id="addToChatPopup-chat">
            <h3>Add User</h3>
            <input type="text" id="searchUserInput" placeholder="Type to search users...">
            <div id="searchResults"></div>
        </div>
        <div class="action-popup-chat" id="uploadFilePopup-chat" style="display:none;">
                <h3>Upload File</h3>
                <input type="file" id="fileInput" />
                <button id="uploadFileBtn">Upload</button>
        </div>
    `;

    chatOption.innerHTML = buttonHTML;

    const menuBtn = document.getElementById('menuBtn-chat');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const popup = document.getElementById('popup-chat');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
    } else {
        console.error('Element with ID "menuBtn-chat" not found.');
    }

    document.getElementById('changeChatNameForm-chat').addEventListener('submit', handleChangeChatNameSubmit);
    const kickForm = document.getElementById('kickFromChatForm-chat');
    if (kickForm) {
        kickForm.addEventListener('submit', handleKickFromChatSubmit);
    }

    // Ensure no form has an action attribute
    document.querySelectorAll('form').forEach(form => {
        form.removeAttribute('action');
    });

    // Add event listener for dynamic user search
    document.getElementById('searchUserInput').addEventListener('input', function() {
        const query = this.value;
        if (query.length > 0) {
            fetch(`/app/${session_id}/${chat_id_current}/searchUsers?query=${encodeURIComponent(query)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const users = data.map(user => ({
                        user_id: user.user_id,
                        name: user.name
                    }));

                    const searchResults = document.getElementById('searchResults');
                    searchResults.innerHTML = users.map(user => `
                        <div>
                            ${user.name} 
                            <button onclick="addUserToChat('${user.user_id}')">Add</button>
                        </div>
                    `).join('');
                })
                .catch(error => {
                    console.error('Error fetching users:', error);
                });
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    });
}

// Add user to chat
function addUserToChat(user_id) {
    fetch(`/app/${session_id}/${chat_id_current}/${user_id}/add`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(`User ${user_id} added successfully`);
            // Optionally, update the UI to reflect the change
        })
        .catch(error => {
            console.error('Error adding user to chat:', error);
        });
}

function showChangeChatName() {
    closeAllPopups();
    document.getElementById('changeChatNamePopup-chat').style.display = 'block';
}

function handleChangeChatNameSubmit(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const newChatNameInput = document.getElementById('newChatName');
    const newChatName = newChatNameInput.value; // Get the value of the input field
    console.log(`New Chat Name: ${newChatName}`);
    fetch(`/app/${session_id}/${chat_id_current}/changename`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newChatName })
    }).then(response => {
        if (response.ok) {
            console.log("Chat name changed successfully");
            loadchat(session_id);
            loadMessages(session_id, chat_id_current);
        } else {
            console.error("Failed to change chat name");
        }
    }).catch(error => {
        console.error("Error changing chat name:", error);
    });
    closePopup('changeChatNamePopup-chat');
}

function showKickFromChat() {
    closeAllPopups();
    document.getElementById('kickFromChatPopup-chat').style.display = 'block';

    // Dynamically fetch users
    fetch(`/app/${session_id}/${chat_id_current}/listUser`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const users = data.map(user => ({
                user_id: user.user_id,
                name: user.name
            }));

            const form = document.getElementById('kickFromChatForm-chat');
            form.innerHTML = users.map(user => `
                <label>
                    <input type="checkbox" name="users" value="${user.user_id}"> ${user.name}
                </label>
            `).join('');
            form.innerHTML += '<button type="submit">Submit</button>';
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function handleKickFromChatSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const selectedUsers = formData.getAll('users');

    const kickPromises = selectedUsers.map(user_id => {
        return fetch(`/app/${session_id}/${chat_id_current}/${user_id}/kick`, {
            method: 'GET'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                console.log(`User ${user_id} kicked successfully`, data);
            })
            .catch(error => {
                console.error(`Error kicking user ${user_id}:`, error);
            });
    });

    Promise.all(kickPromises).then(() => {
        closePopup('kickFromChatPopup-chat');
        loadchat(session_id);
    });
}

function showDeleteChat() {
    closeAllPopups();
    document.getElementById('deleteChatPopup-chat').style.display = 'block';
}

function deleteChat() {
    fetch(`/app/${session_id}/${chat_id_current}/delete`, {
        method: 'GET'
    })
        .then(response => {
            if (response.ok) {
                closePopup('deleteChatPopup-chat');
                loadchat(session_id);
            } else {
                console.error('Error deleting chat');
            }
        })
        .then(data => {
            console.log('Chat deleted successfully', data);
            closePopup('deleteChatPopup-chat');
            loadchat(session_id);
        })
        .catch(error => {
            console.error('Error deleting chat:', error);
        });
}

let typingTimeout;
const typingDelay = 300; // Delay in milliseconds

function showAddToChat() {
    closeAllPopups();
    document.getElementById('addToChatPopup-chat').style.display = 'block';

    const inputField = document.getElementById('searchUserInput');
    inputField.addEventListener('input', () => {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            fetchUsers(inputField.value);
        }, typingDelay);
    });
}

function fetchUsers(query) {
    fetch(`/app/${session_id}/find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ info: query }),
    })
        .then(response => {
            if (!response.ok) {
                console.log(`Cannot find the user`);
            }
            return response.json();
        })
        .then(data => {
            const users = data.map(user => ({
                user_id: user.user_id,
                name: user.name
            }));

            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = users.map(user => `
                <div>
                    ${user.name}
                    <button onclick="addUserToChat('${user.user_id}')">Add</button>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function closeAllPopups() {
    document.querySelectorAll('.action-popup-chat').forEach(popup => {
        popup.style.display = 'none';
    });
}

function closePopup(id) {
    document.getElementById(id).style.display = 'none';
}






// FRIEND PAGE
document.addEventListener("DOMContentLoaded", function () {
    const friendList = document.getElementById("friendList");
    const friendRequestsList = document.getElementById("friendRequestsList");
    const searchFriendInput = document.getElementById("searchFriendInput");
    const addFriendBtn = document.getElementById("addFriendBtn");
    const searchResultsPopup = document.createElement("div");

    // Styling for the popup
    searchResultsPopup.style.position = "absolute";
    searchResultsPopup.style.backgroundColor = "white";
    searchResultsPopup.style.border = "1px solid #ccc";
    searchResultsPopup.style.zIndex = "1000";
    searchResultsPopup.style.display = "none";
    searchResultsPopup.style.maxHeight = "200px";
    searchResultsPopup.style.overflowY = "auto";

    document.body.appendChild(searchResultsPopup);

    let friends = [];

    // Load user info
    function loadInfo(info) {
        return fetch(`/app/${session_id}/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ info: info })
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load info');
            }
        });
    }
    //Friends already added:
    // Fetch friends from the server
    function fetchFriends() {
        fetch(`/app/friend/${session_id}/listfriend`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch friends');
                }
                return response.json();
            })
            .then(data => {
                friends = data.map(friend => friend);
                console.log("Fetched friends:", friends); // Debug log
                displayFriends();
            })
            .catch(error => {
                console.error("Error fetching friends:", error);
                // Handle error: display a message to the ser or retry logic
            });
    }

	function displayFriends() {
		    friendList.innerHTML = "";
		    friends.forEach(friend => {
		        const button = document.createElement("button");
		        button.textContent = friend.username;
		        button.className = "friend-button";

		        button.addEventListener("click", () => {
		            console.log(`Clicked on friend: ${friend.username} (ID: ${friend.user_id})`);
		            fetch(`/app/chat/existBetween/${session_id}/${friend.user_id}`)
		                .then(response => {
		                    if (!response.ok) throw new Error("Failed to check chat");
		                    return response.text(); // giả sử trả về chatId hoặc ""
		                })
		                .then(chatId => {
		                    if (chatId) {
		                        // Chat riêng đã tồn tại, load chat
		                        console.log("Chat room exists:", chatId);
		                        window.location.href = `/mainchat.html?id=${session_id}&chatId=${chatId}`
		                    } else {
		                        // Tạo chat room mới rồi load
		                        const newGroup = {
		                            name: `${friend.username}`,
		                            session_id: session_id  // biến session_id hiện tại
		                        };
		                        fetch(`/app/${session_id}/createChatroom`, {
		                            method: 'POST',
		                            headers: { 'Content-Type': 'application/json' },
		                            body: JSON.stringify(newGroup)
		                        })
		                        .then(resp => {
		                            if (!resp.ok) throw new Error("Failed to create chat room");
		                            return resp.text(); // trả về chatId mới (cần backend trả về đúng chatId)
		                        })
		                        .then(newChatId => {
		                            console.log("Created new chat room:", newChatId);
		                            // Thêm 2 người vào chat room
		                            Promise.all([
		                                fetch(`/app/${session_id}/${newChatId}/${friend.user_id}/add`, { method: 'GET' })
		                            ]).then(() => {
		                                window.location.href = `/mainchat.html?id=${session_id}&chatId=${newChatId}`
		                            }).catch(err => console.error("Error adding users to chat:", err));
		                        })
		                        .catch(err => console.error(err));
		                    }
		                })
		                .catch(err => console.error(err));
						
		        });

		        friendList.appendChild(button);
		    });
		}


    // Send friend request to a user
    function sendFriendRequest(user_id) {
        fetch(`/app/friend/${session_id}/${user_id}/sendRequest`, {
            method: 'POST'
        })
            .then(response => {
                if (response.ok) {
                    //loadFriendRequests();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(`Failed to send friend request: ${JSON.stringify(errorData)}`);
                    });
                }
            })
            .catch(error => {
                console.error("Error sending friend request:", error);
            });
    }

    // Find a friend based on a search query
    async function findFriend(query) {
        try {
            const results = await loadInfo(query);
            displaySearchResults(results);
        } catch (error) {
            console.error("Error finding friends:", error);
        }
    }

    // Display search results in a popup
    function displaySearchResults(results) {
        searchResultsPopup.innerHTML = "";
        results.forEach(user => {
            const resultDiv = document.createElement("div");
            resultDiv.textContent = user.name;
            const requestBtn = document.createElement("button");
            requestBtn.textContent = "Send Request";
            requestBtn.addEventListener("click", () => sendFriendRequest(user.user_id));
            resultDiv.appendChild(requestBtn);
            searchResultsPopup.appendChild(resultDiv);
        });

        const inputRect = searchFriendInput.getBoundingClientRect();
        searchResultsPopup.style.left = `${inputRect.left}px`;
        searchResultsPopup.style.top = `${inputRect.bottom}px`;
        searchResultsPopup.style.width = `${inputRect.width}px`;
        searchResultsPopup.style.display = "block";
    }


    // Load friend requests received by the user
    async function loadFriendRequests() {
        try {
            const response = await fetch(`/app/friend/${session_id}/loadRequestReceived`);
            if (!response.ok) {
                throw new Error('Failed to load friend requests');
            }
            const friendRequests = await response.json();

            friendRequestsList.innerHTML = "";
            for (const request of friendRequests) {
                const userPublics = await loadInfo(request.user_id1);
                if (userPublics.length > 0) {
                    const userPublic = userPublics[0];

                    // Create list item
                    const li = document.createElement("li");
                    li.textContent = `${userPublic.name}`;

                    // Create accept and refuse button
                    const acceptBtn = document.createElement("button");
                    acceptBtn.textContent = "Accept";
                    acceptBtn.addEventListener("click", () => acceptFriendRequest(userPublic.user_id));

                    const refuseBtn = document.createElement("button");
                    refuseBtn.textContent = "Refuse";
                    refuseBtn.addEventListener("click", () => refuseFriendRequest(userPublic.user_id));



                    // Append elements
                    li.appendChild(acceptBtn);
                    friendRequestsList.appendChild(li);
                }
            }
        } catch (error) {
            console.error("Error loading friend requests:", error);
            // Handle error: display a message to the user or retry logic
        }
    }

    // Accept and refuse friend request
    function acceptFriendRequest(user_id) {
        fetch(`/app/friend/${session_id}/${user_id}/accept`, {
            method: 'POST',
        })
            .then(response => {
                if (response.ok) {
                    loadFriendRequests();
                    fetchFriends();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(`Failed to accept friend request: ${JSON.stringify(errorData)}`);
                    });
                }
            })
            .catch(error => {
                console.error("Error accepting friend request:", error);
                // Handle error: display a message to the user or retry logic
            });
    }

    function refuseFriendRequest(user_id) {
        fetch(`/app/friend/${session_id}/${user_id}/refuse`, {
            method: 'POST',
        })
            .then(response => {
                if (response.ok) {
                    loadFriendRequests();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(`Failed to refuse friend request: ${JSON.stringify(errorData)}`);
                    });
                }
            })
            .catch(error => {
                console.error("Error refusing friend request:", error);
                // Handle error: display a message to the user or retry logic
            });
    }

    // Event listener for input in search box
    searchFriendInput.addEventListener("input", function () {
        const query = searchFriendInput.value.trim();
        if (query) {
            findFriend(query);
        } else {
            searchResultsPopup.style.display = "none";
            fetchFriends();
        }
    });

    // Event listener for add friend button
    addFriendBtn.addEventListener("click", async function () {
        const friendName = searchFriendInput.value.trim();
        if (friendName) {
            try {
                const results = await loadInfo(friendName); // Fetch users by name
                if (results.length > 0) {
                    sendFriendRequest(results[0].user_id); // Send request to the first match
                } else {
                    console.error('No user found with that name');
                }
            } catch (error) {
                console.error("Error finding user:", error);
            }
        }
    });

    // Event listener to close search results popup if clicked outside
    document.addEventListener("click", function (event) {
        if (!searchFriendInput.contains(event.target) && !searchResultsPopup.contains(event.target)) {
            searchResultsPopup.style.display = "none";
        }
    });

    // Initial load of friends and friend requests
    fetchFriends();
    loadFriendRequests();
});



// Function to navigate to main chat page
function chat_Link() {
    const sessionId = getSessionID();
    console.log(sessionId);
    window.location.href = `mainchat.html?id=${sessionId}`;
}

// Function to navigate to friend list page
function contact_Link() {
    const sessionId = getSessionID();
    console.log(sessionId);
    window.location.href = `friendlist.html?id=${sessionId}`;
;}
function showUploadFile() {
    closeAllPopups();
    const popup = document.getElementById('uploadFilePopup-chat');
    popup.style.display = 'block';
}

function closeAllPopups() {
    document.querySelectorAll('.action-popup-chat').forEach(popup => {
        popup.style.display = 'none';
    });
}

document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'uploadFileBtn') {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput || !fileInput.files[0]) {
            alert('Chọn file trước khi upload!');
            return;
        }
        const file = fileInput.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('File vượt quá dung lượng 2MB!');
            fileInput.value = '';
            return;
        }
        //chon file va up file len server
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        fetch('/upload-chat-file', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.url && data.filename) {
                    // Gửi message qua WebSocket (hoặc API gửi message)
                    sendMessage(session_id, chat_id_current, data.url + "|" + data.filename, new Date(), 'FILE');

                    // Đóng popup upload
                    document.getElementById('uploadFilePopup-chat').style.display = 'none';

                    // Load lại message để hiện file
                    setTimeout(() => {
                        loadMessages(session_id, chat_id_current);
                    }, 300);
                } else {
                    alert(data.error || 'Lỗi upload file');
                }
            })
            .catch(e => alert('Lỗi khi upload file'));
    }
});








