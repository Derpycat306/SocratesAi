import {Chat} from './history.js'

const textInput = document.getElementById("user-input");
const sendInput = document.getElementById("send-btn");

sendInput.addEventListener("click", () => {
    console.log("asking new prompt");
    let temp = new Chat();
    let text = textInput.value;
    console.log(askAI(text, temp));
});