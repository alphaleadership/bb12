var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}

ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })
ipcRenderer.send("getBotPrefix", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getBotPrefix", async function (event, prefix) {
    document.getElementById("loadCommands").innerHTML = prefix+"ass<br>"+prefix+"blowjob<br>"+prefix+"boobs<br>"+prefix+"cowgirl<br>"+prefix+"cumshots<br>"+prefix+"doggystyle<br>"+prefix+"hentai<br>"+prefix+"missionary<br>"+prefix+"pussy"
})
var user = ipcRenderer.sendSync("getUser")

document.getElementById("imageUser").src = "https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".webp";
document.getElementById("nameUser").innerHTML = user.username