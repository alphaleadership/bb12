var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}
console.log("a")
ipcRenderer.send("getBotPrefix", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getBotPrefix", async function (event, prefix) {
    document.getElementById("submessage").innerHTML = document.getElementById("submessage").innerHTML.replace("{tournois}",prefix+"tournoi")
})
 