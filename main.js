import { History} from './history.js'
import { askAI } from './ai.js';

const textInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const messagesDisplay = document.getElementById("messages");
const newChatButton = document.getElementById("newchat-btn");
const chatList = document.getElementById("chat-list");
const txtbox = messagesDisplay.querySelector(".txtbox");

// Load existing data or start a new chat
History.load();
let currentChat = null;

// ─── Update the message display ─────────────────────────────────────

function updateUI() {
    if (!currentChat || !currentChat.list) {
        if (txtbox) {
            txtbox.innerHTML = "";
        } else {
            messagesDisplay.innerHTML = "";
        }
        return;
    };

    // Build the turn HTML
    const turns = currentChat.list.map(turn => `
        <div class="mb-3">
            <div id="user-chat">
                <p class="fw-bold mb-0">You: ${turn.prompt}</p>
            </div>
            <div id="socrates-chat">
                <p class="text-muted fw-bold italic mb-0">Socrates: ${turn.response}</p></p>
            </div>
        </div>
    `).join('');
    // Render into the .txtbox div, preserving the sticky <img>

    if (txtbox) {
        txtbox.innerHTML = turns;
    } else {
        // Fallback: no .txtbox found, append directly
        messagesDisplay.innerHTML = turns;
    }

    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

// ─── Rebuild the sidebar chat list ─────────────────────────────────
// ─── Rebuild the sidebar chat list ─────────────────────────────────
function updateChats(){
    let html = [];
    History.chats.forEach((chat) => {
        let name = chat.name;
        let escaped = name.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        /*html.unshift(`<li data-chat-name="${escaped}">${escaped}</li>`); */
        html.push(`
            <li class="chat-item" data-chat-name="${escaped}">
              <span class="chat-title">${escaped}</span>
              <button class="delete-chat" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
            </li>
            `);
            

    });
    chatList.innerHTML = html.join("");

    // add click event for chat list
    chatList.querySelectorAll("li").forEach(li => {
        const deleteBtn = li.querySelector(".delete-chat");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const name = li.dataset.chatName;
        
                if (currentChat && currentChat.name === name) {
                    currentChat = null;
                    updateUI();
                }
        
                History.removeChat(name);

                // auto-select another chat if available
                if (History.chats.length > 0) {
                    currentChat = History.chats[0];
                } else {
                    currentChat = null;
                }

                updateChats();
                updateUI();

            });
        }
        

        
        li.addEventListener("click", () => {
            let name = li.dataset.chatName;
            currentChat = History.getObj(name);
            console.log("clicked chat:", name, "getObj returned:", currentChat, "list:", currentChat?.list);
            chatList.querySelectorAll("li").forEach(l => { l.classList.remove("active"); });
            li.classList.add("active");
            updateUI();
        });

        // add mmb delete listener for chat list
        li.addEventListener("mousedown", (event) => {
            // middle click — delete chat
            if (event.button === 1){
                event.preventDefault();
                let name = li.dataset.chatName;
                if (currentChat && currentChat.name === name){
                    currentChat = null;
                    updateUI();
                }
                History.removeChat(name);
                updateChats();
            }
        });

        // add right click rename listener for chat list
        li.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            startInlineRename(li, li.dataset.chatName);
        });

        // Re-highlight the active chat after rebuild
        if (currentChat && li.dataset.chatName === currentChat.name){
            li.classList.add("active");
        }
    });
}

// ─── Inline Rename ──────────────────────────────────────────────────
function startInlineRename(li, oldName) {
    let committed = false;

    let input = document.createElement("input");
    input.type = "text";
    input.value = oldName;
    input.className = "rename-input";

    li.innerHTML = "";
    li.appendChild(input);
    input.focus();
    input.select();

    function commit() {
        if (committed) return;
        committed = true;

        let newName = input.value.trim();
        if (!newName || newName === oldName) {
            updateChats(); // restore original
            return;
        }

        if (History.renameChat(oldName, newName)) {
            if (currentChat && currentChat.name === oldName) {
                currentChat = History.getObj(newName);
            }
        }
        updateChats();
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { committed = true; updateChats(); }
    });

    input.addEventListener("blur", commit);
}

// ─── New Chat button ────────────────────────────────────────────────

function newChat(){
    let string = "New Chat";
    let chat = History.newChat(string);
    if(!chat){
        for(let i = 1; i < 999; i++){
            string = `New Chat (${i})`;
            chat = History.newChat(string)
            if(chat) break;
        }   
    }
    if(!currentChat){
        currentChat = chat;
    }
    updateChats();
}

newChatButton.addEventListener("click", newChat);

// Send button event listener
sendButton.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return;
    if (!currentChat) {
        newChat();
    }

    console.log("logging prior turns")
    for(const turn of currentChat.list){
        console.log(turn);
    }


    console.log("Asking Socrates...");
    textInput.value = "";
    txtbox.innerHTML += 
    `<div id="user-chat"><p class="fw-bold mb-0">You: ${text}</p></div><div id="socrates-chat"><div class="loader"></div></div>`;

    // gets response from socrates
    try {
        const aiResponse = await askAI(currentChat, text);
        if(aiResponse){
            currentChat.add(text, aiResponse);
            History.save();
        }
        updateUI();

    } catch (error) {
        console.error("Failed to get response:", error);
    }
});

// Also send on Enter key
textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendButton.click();
    }
});

// Initial render
updateChats();