var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}
ipcRenderer.send("getBotPrefix", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getBotPrefix", async function (event, prefix) {
    while (document.body.innerHTML.includes("{prefix}")){
        document.body.innerHTML = document.body.innerHTML.replace("{prefix}",prefix)
    }
    ipcRenderer.send("getConfigData", { "botId": parent.currentBotOpenId, "extensionId": "uno-extension" })
})


ipcRenderer.on("getConfigData", async function(event,config){
    console.log(config,config.binchannel)
    if (config.binchannel){
        document.getElementById("binChannelSelect").value = config.binchannel
    }
})

ipcRenderer.on("saveConfigData", async function(event,result){
    if (result.success == true){
        document.getElementById("binChannelSelect").style.borderColor = "green"
        document.getElementById("binChannelSelect").style.color = "green"
    }
})

function saveConfig(){
    var channelId = document.getElementById("binChannelSelect").value
    ipcRenderer.send("saveConfigData",{"config":{"binchannel":channelId},"extensionId":"uno-extension","botId":parent.currentBotOpenId})
}
