import { History} from './history.js'
import { askAI } from './ai.js';

const textInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const messagesDisplay = document.getElementById("messages");
const newChatButton = document.getElementById("newchat-btn");
const chatList = document.getElementById("chat-list");

// Load existing data or start a new chat
History.load();
let currentChat = null;

// ─── Update the message display ─────────────────────────────────────
function updateUI() {
    if (!currentChat) return;
    if(!currentChat.list) return;

    // Build the turn HTML
    const turns = currentChat.list.map(turn => `
        <div class="mb-3">
            <p class="fw-bold mb-0">You: ${turn.prompt}</p>
            <p class="text-muted italic">Socrates: ${turn.response}</p>
        </div>
    `).join('');

    // Render into the .txtbox div, preserving the sticky <img>
    const txtbox = messagesDisplay.querySelector(".txtbox");
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
        html.push(`<li data-chat-name="${escaped}">${escaped}</li>`);
    });
    chatList.innerHTML = html.join("");

    chatList.querySelectorAll("li").forEach(li => {
        li.addEventListener("click", (event) => {
            let name = li.dataset.chatName;
            currentChat = History.getObj(name);
            console.log("clicked chat:", name, "getObj returned:", currentChat, "list:", currentChat?.list);
            chatList.querySelectorAll("li").forEach(l => { l.classList.remove("active"); });
            li.classList.add("active");
            updateUI();
        });

        li.addEventListener("mousedown", (event) => {
            // middle click — delete chat
            if (event.button === 1){
                event.preventDefault();
                let name = li.dataset.chatName;
                History.removeChat(name);
                if (currentChat && currentChat.name === name){
                    currentChat = null;
                    updateUI();
                }
                updateChats();
            }
        });

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
newChatButton.addEventListener("click", () => {
    if(!History.newChat("New Chat")){
        for(let i = 1; i < 999; i++){
            let string = `New Chat (${i})`;
            if(History.newChat(string)) break;
        }   
    }
    updateChats();
});

// Send button event listener
sendButton.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return;
    if (!currentChat) {
        console.warn("No chat selected — pick or create one first.");
        return;
    }
    let chat = History.getObj(currentChat);

    console.log("Asking Socrates...");

    try {
        const aiResponse = await askAI(chat, text);
        currentChat.add(text, aiResponse);
        History.save();

        textInput.value = "";
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

async function ask(){
    console.log("asking new prompt");
}