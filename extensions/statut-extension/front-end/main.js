var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = 
console.log("a")
ipcRenderer.send("getConfigData", { "botId": parent.currentBotOpenId, "extensionId": "statut-extension" })
ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getGuilds", async function (event, guildsData) {
    if (guildsData.success == true) {
        botGuilds = guildsData.data

    }
})

ipcRenderer.on("getConfigData", async function(event,config){
    configData = config
    console.log(configData)
    if (configData.status[0]){
    	document.getElementById("statusTextInput1").value = configData.status[0]
    }
    if (configData.status[1]){
    	document.getElementById("statusTextInput2").value = configData.status[1]
    }
    if (configData.status[2]){
    	document.getElementById("statusTextInput3").value = configData.status[2]
    }
    if (configData.status[3]){
    	document.getElementById("statusTextInput4").value = configData.status[3]
    }
    if(configData.statusType === "PLAYING"){
        document.getElementById("1").classList.remove("btn-primary")
        document.getElementById("1").classList.add("btn-secondary")
    }

    if(configData.statusType === "LISTENING"){
        document.getElementById("3").classList.remove("btn-primary")
        document.getElementById("3").classList.add("btn-secondary")
    }
    if(configData.statusType === "WATCHING"){
        document.getElementById("4").classList.remove("btn-primary")
        document.getElementById("4").classList.add("btn-secondary")
    }
    if(!configData.statusType){
        document.getElementById("1").classList.remove("btn-primary")
        document.getElementById("1").classList.add("btn-secondary")
    }
})

ipcRenderer.on("saveConfigData", async function(event,result){
    if (result.success == true){
        document.getElementById("save-config-div-result").style.display = "block"
    }
})

function selection(id){
    if(id === "1"){
        document.getElementById("3").classList.add("btn-primary")
        document.getElementById("4").classList.add("btn-primary")
        document.getElementById("3").classList.remove("btn-secondary")
        document.getElementById("4").classList.remove("btn-secondary")


    }
if(id === "3"){
        document.getElementById("1").classList.add("btn-primary")
        document.getElementById("4").classList.add("btn-primary")
        document.getElementById("1").classList.remove("btn-secondary")
        document.getElementById("4").classList.remove("btn-secondary")

    }if(id === "4"){
        document.getElementById("3").classList.add("btn-primary")
        document.getElementById("1").classList.add("btn-primary")
        document.getElementById("3").classList.remove("btn-secondary")
        document.getElementById("1").classList.remove("btn-secondary")

    }
    document.getElementById(id).classList.remove("btn-primary")
    document.getElementById(id).classList.add("btn-secondary")
}

var btnClick = "PLAYING"
function changeStatusType(status){
  btnClick = status
}

function saveConfig(){
        configData = {"status":[]}
        configData.statusType = btnClick
        console.log(configData.statusType)
        configData.status.push(document.getElementById("statusTextInput1").value)
        if(document.getElementById("statusTextInput2").value !== ""){
        configData.status.push(document.getElementById("statusTextInput2").value)}
        if(document.getElementById("statusTextInput3").value !== ""){
        configData.status.push(document.getElementById("statusTextInput3").value)}
        if(document.getElementById("statusTextInput4").value !== ""){
        configData.status.push(document.getElementById("statusTextInput4").value)}
        ipcRenderer.send("saveConfigData",{"config":configData,"extensionId":"statut-extension","botId":parent.currentBotOpenId})
    
}

