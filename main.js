import { History} from './history.js'
import { askAI } from './ai.js';

const textInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const messagesDisplay = document.getElementById("messages");
const newChatButton = document.getElementById("newchat-btn");
const chatList = document.getElementById("chat-list");
// Load existing data or start a new chat
History.load();
let currentChat = null

// Update the screen
function updateUI() {
    if (!currentChat) return;
    if(!currentChat.list) return;
    messagesDisplay.innerHTML = currentChat.list.map(turn => `
        <div class="mb-3">
            <p class="fw-bold mb-0">You: ${turn.prompt}</p>
            <p class="text-muted italic">Socrates: ${turn.response}</p>
        </div>
    `).join('');
    messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

function updateChats(){
        let html = [];
        History.chats.forEach((chat)=>{
            let name = chat.name;
            console.log(name);
            html.push(`<li>${name}</li>`);
        })
        chatList.innerHTML = html.join("");
}

chatList.addEventListener('click', event => {
    const item = event.target.closest('li');
    if(!item || !item.contains(li))return;

});

// sendButton.addEventListener("click", async () => {
//     const text = textInput.value.trim();
//     if (!text) return;

//     console.log("Asking Socrates...");
    
//     try {
//         // Corrected order: (HistoryArray, NewText)
//         const aiResponse = await askAI(currentChat.list, text);
        
//         const newTurn = new Turn(text, aiResponse);
//         currentChat.add(newTurn);

//         History.save();
//         textInput.value = "";
//         updateUI();
//     } catch (error) {
//         console.error("Failed to get response:", error);
//     }
// });

// Run UI update on load

// Handle click
// sendButton.addEventListener("click", async () => {
//     const text = textInput.value.trim();
//     if (!text) return;

//     console.log("Asking Socrates...");
    
//     // Get the AI response (using async if askAI is a network call)
//     //const aiResponse = await askAI(text, currentChat);
//     const aiResponse = await askAI(currentChat.list, text);
    
//     // Create a new Turn and add it to our currentChat
//     const newTurn = new Turn(text, aiResponse);
//     currentChat.add(newTurn);

//     // Save the whole History to LocalStorage
//     History.save();

//     // Clear input and refresh the screen
//     textInput.value = "";
//     updateUI();
// });

// Initial render in case there's loaded history

newChatButton.addEventListener("click", () => {
    if(!History.newChat("New Chat")){
        for(let i = 1; i < 999; i++){
            let string = `New Chat (${i})`;
            if(History.newChat(string))break;
        }   
    }
    updateChats();
});

async function ask(){
    console.log("asking new prompt");
    let text = String(textInput.value);
    const response = await askAI(null, text);
    console.log(response); 
}

sendButton.addEventListener("click", ask);