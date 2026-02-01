import { History, Chat} from './history.js'
import { askAI } from './ai.js';

const textInput = document.getElementById("user-input");
const sendInput = document.getElementById("send-btn");
const messagesDisplay = document.getElementById("messages");

// Load existing data or start a new chat
History.load();
let currentChat = History.chats.length > 0 ? History.chats[0] : History.newChat("First Dialogue");

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

sendBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return;

    console.log("Asking Socrates...");
    
    try {
        // Corrected order: (HistoryArray, NewText)
        const aiResponse = await askAI(currentChat.list, text);
        
        const newTurn = new Turn(text, aiResponse);
        currentChat.add(newTurn);

        History.save();
        textInput.value = "";
        updateUI();
    } catch (error) {
        console.error("Failed to get response:", error);
    }
});

// Run UI update on load
updateUI();

// Handle click
sendInput.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return;

    console.log("Asking Socrates...");
    
    // Get the AI response (using async if askAI is a network call)
    //const aiResponse = await askAI(text, currentChat);
    const aiResponse = await askAI(currentChat.list, text);
    
    // Create a new Turn and add it to our currentChat
    const newTurn = new Turn(text, aiResponse);
    currentChat.add(newTurn);

    // Save the whole History to LocalStorage
    History.save();

    // Clear input and refresh the screen
    textInput.value = "";
    updateUI();
});

// Initial render in case there's loaded history
updateUI();

async function ask(){
    console.log("asking new prompt");
    let text = String(textInput.value);
    const response = await askAI(null, text);
    console.log(response); 
}

sendInput.addEventListener("click", ask);