var client,dataFolder,electron
const fs = require("fs")
module.exports = {
    start(){
        console.log("b")
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        var configData = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8"))
        let les_status = configData.status
        setInterval(async function()  {
        var statut = les_status[Math.floor(Math.random()*les_status.length)];
        var memberss = client.users.cache.size
        statut=statut.replace("{members}", client.users.cache.size)
        statut=statut.replace("{servers}", client.guilds.cache.size)
        console.log(configData.statusType)
        client.user.setActivity(statut, { type: configData.statusType }, { url: "https://www.twitch.tv/gotaga"})
    }, 10000)
    }
}