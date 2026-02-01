export class Turn{
    constructor(prompt, response){
        this.prompt = prompt;
        this.response = response;
    }
}

export class Chat{
    constructor(name){
        this.list = [];
        this.count = 0;
        this.name = name;
    }

    add(turn){
        this.list.push(turn);
        this.count++;
    }

    rename(name){
        this.name = name;
    }
}

export class History{
    static chats = [];
    static size = 0;

    // saves history to file
    static save(){
        localStorage.setItem(
            "chatHistory",
            JSON.stringify(History.chats)
        );
    }

    // loads history from file
    static load(){
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

        return chats[History.findIndex(name)];
    }

    // defines a new chat and adds it to the list
    static newChat(name){
        if(History.contains(name)){
            console.log(`chat "${name}" not added, chat of same name exists`);
            return null;
        }
        let c = new Chat(name);
        History.chats.push(c);
        History.size++;
        History.save();
        console.log(`chat "${name}" successfully added.`);
        return c;
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
}