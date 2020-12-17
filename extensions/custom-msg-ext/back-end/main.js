////////////////////////////
//       Custom MSG       //
//     By Koro~ (馬鹿)     //
////////////////////////////

const fs = require('fs');

module.exports = {
    start(){
        const bot = this.client;
        const df = this.dataFolder;
        const cd = JSON.parse(fs.readFileSync(df+"/webpage-data/config.json","utf-8"));
        const prefix = this.prefix;
        bot.on('message', message => {
            // Check if the command has been added
            if (cd[message.content.substr(prefix.length)]) {
                const msg = cd[message.content.substr(prefix.length)].message
                    .replace(/\{author}/g, `<@${message.author.id}>`)
                message.channel.send(msg)
            }
        })
    }
}