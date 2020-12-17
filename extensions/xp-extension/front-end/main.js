var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}

ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })
ipcRenderer.send("getBotPrefix", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getBotPrefix", async function (event, prefix) {
    document.getElementById("loadCommands").innerHTML = prefix+"rank (Permet a l'utilisateur de voir son niveau et son xp)<br>"+prefix+"leaderboard (Permet a l'utilisateur de voir le classement du serveur)"
})
var user = ipcRenderer.sendSync("getUser")

document.getElementById("imageUser").src = "https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".webp";
document.getElementById("nameUser").innerHTML = user.username
