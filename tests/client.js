const racecord = require("../lib");
const {commands} = racecord;
const {CommandBuilder} = commands;
const perf = require("perf_hooks");
const readline = require("readline-sync");
const MessageRecord = racecord.MessageRecord;
const ActionTypes = racecord.actionTypes;
const util = require("util");

racecord.client.connect(readline.question("token\n"));

const microTime = () => {
    var hrTime = process.hrtime()
    return hrTime[0] * 1000000 + hrTime[1] / 1000;
}

const times = {};
racecord.internal.internalDispatcher.register(action => {
    switch (action.type) {
        case "MESSAGE_CREATE":
            times[action.data.id] = microTime()
    }
});

const commander = new racecord.Commander("=");
const pingCommand = CommandBuilder.name("ping").handler(e => {
    let pongText = `pong\nracecord (time from gateway to command): ${microTime() - times[e.message.id]}us\ndiscord: \`plox wait im thinking bitch\``;
    const preEdit = Date.now();
    e.reply(pongText).then(newMessage => {
        const editedTimestamp = new Date(newMessage.timestamp).getTime();
        const editedTime = preEdit - editedTimestamp;
        pongText = pongText.substring(0, pongText.indexOf("plox")) + `${editedTime}ms\``;
        newMessage.edit({content: pongText});
    });
});

/**
 * Creates an argumented command with the following argdefs:
 * 
 * INDEX 0: STRING
 * INDEX 1: BOOLEAN - NAME: IS QUEEN - DESCRIPTION: IS YOU A QUEEN
 * INDEX 2: NUMBER
 */
const argumentedCommand = CommandBuilder.name("argumented").args(String, {type: Boolean, name: "Is Queen", description: "Is you a queen?"}, Number);

const ping2Command = {
    opts: {
        name: "ping2",
    },
    handler: e => e.reply("pong")
}
const evalCommand = CommandBuilder.name("eval").handler(async e => {
    try {
        const result = util.inspect(await eval(e.args.join(" ")), true, 0);
        if (result.length > 1900) {
            const splits = result.match(/[\s\S]{1,1900}/);
            console.log(splits[0]);
            splits.forEach(split => e.reply(`\`\`\`js\n${split}\`\`\``));
            return;
        }
        e.reply(`\`\`\`js\n${result}\`\`\``);
    } catch (result) {
        result = util.inspect(result, true, 0);
        if (result.length > 1900) {
            const splits = result.match(/[\s\S]{1,1900}/);
            splits.forEach(split => e.reply(`\`\`\`js\n${split}\`\`\``));
        }
        e.reply(`\`\`\`js\n${result}\`\`\``);
    }
}).use(racecord.commands.guards.UserGuard(["163024083364216832"]));
commander.register([pingCommand, ping2Command, evalCommand]);