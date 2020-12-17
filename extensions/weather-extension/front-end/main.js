var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}
ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })