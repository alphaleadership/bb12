var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}
console.log("a")
ipcRenderer.send("getBotPrefix", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getBotPrefix", async function (event, prefix) {
    while (document.getElementById("submessage").innerHTML.includes("{prefix}")){
        document.getElementById("submessage").innerHTML = document.getElementById("submessage").innerHTML.replace("{prefix}",prefix)
    }
})
 