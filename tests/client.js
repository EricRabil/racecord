const racecord = require("../lib");
const readline = require("readline-sync");
const MessageRecord = racecord._internal.Records.MessageRecord;
const ActionTypes = racecord.ActionTypes;

racecord.Client.connect(readline.question("token\n"));

racecord.Dispatcher.register(action => {
    switch (action.type) {
        case ActionTypes.MESSAGE_CREATE:
            const message = action.data;
            if (message.content === "=ping" && message instanceof MessageRecord) {
                message.channel.sendMessage({content: "Pong!"}).then(newMessage => {
                    setTimeout(() => {
                        newMessage.edit({content: "Pong!!!1"}).then(() => {
                            setTimeout(() => {
                                newMessage.delete();
                            }, 2000);
                        });
                    }, 2000);
                });
                message.react("🆗").then(() => {
                    setTimeout(() => {
                        message.removeOwnReaction("🆗");
                    }, 2000);
                });
            }
            break;
    }
});
