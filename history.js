export class Turn{
    constructor(prompt, response){
        this.prompt = prompt;
        this.response = response;
    }
}

class Chat{
    constructor(name){
        this.list = [];
        this.count = 0;
        this.name = name;
    }

    add(prompt, response){
        let t = new Turn(prompt, response);
        this.list.push(t);
        this.count++;
    }

    rename(name){
        this.name = name;
    }
}

export class History{
    static chats = [];

    // saves history to file
    static save(){
        localStorage.setItem(
            "chatHistory",
            JSON.stringify(History.chats)
        );
    }

    // loads history from file
    static load(){
        return
        const raw = localStorage.getItem("chatHistory");
        if(!raw)return;

        const parsed = JSON.parse(raw);

        // Rehydrate classes
        History.chats = parsed.map(h => {
            const chat = new Chat();
            chat.list = h.list.map(
                t => new Turn(t.prompt, t.response)
            );
            return chat;
        });
    }

    // get the index of given chat. -1 if chat doesn't exist
    static findIndex(name){
        return History.chats.findIndex(chat => chat.name === name);
    }

    // checks if a given chat exists
    static contains(name){
        return History.findIndex(name) !== -1;
    }

    static getObj(name){
        if(!History.contains(name)){
            return null;
        }

        return History.chats[History.findIndex(name)];
    }

    // defines a new chat and adds it to the list
    static newChat(name){
        if(History.contains(name)){
            console.log(`chat "${name}" not added, chat of same name exists`);
            return false;
        }
        let c = new Chat(name);
        History.chats.push(c);
        History.save();
        console.log(`chat "${name}" successfully added.`);
        return true;
    }

    // removes a chat of given name
    static removeChat(name){
        if(!History.contains(name)){
            console.log(`chat "${name};" does not exist, unable to remove`)
        }else{
            console.log(`successfully removed chat "${name};"`);
        }
    }

    static renameChat(name, newName){
        let chat = History.getObj(name);
        if(chat == null)return false;

        chat.rename(newName);
        return true;
    }

    static toHTML(){
        let html = [];
        History.chats.forEach((chat)=>{
            let name = chat.name;
            console.log(name);
            html.push(`<li>${name}</li>`);
        })
        return html.join("");
    }
}