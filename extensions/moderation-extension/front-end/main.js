var ipcRenderer = parent.ipcRenderer
var botGuilds
var configData = {}

var badWordDiv = `<div class="bad-word-div">
<p>
    {word}
</p>
<img src="./icons/x.png" onclick="deleteWord('{word}')">
</div>
<hr class="separator badWordSeparator"/>`
ipcRenderer.send("getConfigData", { "botId": parent.currentBotOpenId, "extensionId": "moderation-extension" })
ipcRenderer.send("getGuilds", { "botId": parent.currentBotOpenId })
ipcRenderer.on("getGuilds", async function (event, guildsData) {
    if (guildsData.success == true) {
        botGuilds = guildsData.data
        document.getElementById("serverSelect").innerHTML = `<option value="default">--Choisissez un serveur--</option>`
        for (var i in botGuilds) {
            document.getElementById("serverSelect").innerHTML += `<option value="` + botGuilds[i].id + `">` + botGuilds[i].name + `</option>`
        }
    }
})
ipcRenderer.on("getGuildChannels", async function(event,botGuilds){
    document.getElementById("logChannelSelect").innerHTML = `<option value="default">Aucun salon sélectionné</option>`
    for (var i in botGuilds.data) {
        console.log(botGuilds.data[i].type)
        if (botGuilds.data[i].type == "text"){
            document.getElementById("logChannelSelect").innerHTML += `<option value="` + botGuilds.data[i].id + `">` + botGuilds.data[i].name + `</option>`
        }
        
    }
    var select = document.getElementById("serverSelect")
    console.log(configData[select.value])
    if (configData[select.value] && configData[select.value].logs){
        document.getElementById("logChannelSelect").value = configData[select.value].logs.channel
    }
})

ipcRenderer.on("getConfigData", async function(event,config){
    configData = config
    console.log(config)
})

function saveConfig(){
    ipcRenderer.send("saveConfigData",{"config":configData,"extensionId":"moderation-extension","botId":parent.currentBotOpenId})
}

function closeAllParameters(){
    document.getElementById("command-parameter-section").style.display="none"
}

function deleteWord(wordToDelete){
    console.log(wordToDelete)
    var select = document.getElementById("serverSelect")
    if (configData[select.value].bad_words.find(word=>word.toLowerCase()==wordToDelete.toLowerCase() )){
        console.log("ok")
        var index = configData[select.value].bad_words.findIndex(word=>word.toLowerCase()==wordToDelete.toLowerCase() )
        configData[select.value].bad_words.splice(index,1)
        updateBadWordList()
        ipcRenderer.send("saveConfigData",{"config":configData,"extensionId":"moderation-extension","botId":parent.currentBotOpenId})
    }
}

function addBadWord(){
    var select = document.getElementById("serverSelect")
    if (!configData[select.value].bad_words){
        configData[select.value].bad_words = []
    }
    var wordToAdd = document.getElementById("add-anti-insult-word-input").value
    if (wordToAdd == "") return document.getElementById("add-anti-insult-word-input").value = "Vous ne pouvez pas ajouter un mot vide"
    if (configData[select.value].bad_words.find(word=>word.toLowerCase()==wordToAdd.toLowerCase())){
        document.getElementById("add-anti-insult-word-input").value = "Mot déjà ajouté"
    }else{
        configData[select.value].bad_words.push(wordToAdd)
        ipcRenderer.send("saveConfigData",{"config":configData,"extensionId":"moderation-extension","botId":parent.currentBotOpenId})
        updateBadWordList()
        document.getElementById("add-anti-insult-word-input").value = ""
    }
}

function updateBadWordList(){
    var select = document.getElementById("serverSelect")
    document.getElementById("words-already-add").innerHTML = ""
    if (configData[select.value].bad_words){
        for (var i in configData[select.value].bad_words){
            if (configData[select.value].bad_words[i] == ""){
                configData[select.value].bad_words.splice(i,1)
            }
        }
        for (var i in configData[select.value].bad_words){
            var thisWordDiv = badWordDiv.replace("{word}",configData[select.value].bad_words[i]).replace("{word}",configData[select.value].bad_words[i])
            document.getElementById("words-already-add").innerHTML+=thisWordDiv
        }
    }
}

function openParameterDiv(div){
    document.getElementById("parameter-command").style.display = "none"
    document.getElementById("side-menu-parameter-commands").classList.remove("select")
    document.getElementById("parameter-antiinsult").style.display = "none"
    document.getElementById("side-menu-parameter-antiinsult").classList.remove("select")
    document.getElementById("parameter-logs").style.display = "none"
    document.getElementById("side-menu-parameter-logs").classList.remove("select")
    if (div == "commands"){
        document.getElementById("parameter-command").style.display = "block"
        document.getElementById("side-menu-parameter-commands").classList.add("select")
    }
    if (div == "anti-insult"){
        document.getElementById("parameter-antiinsult").style.display = "block"
        document.getElementById("side-menu-parameter-antiinsult").classList.add("select")
    }
    if (div == "logs"){
        document.getElementById("parameter-logs").style.display = "block"
        document.getElementById("side-menu-parameter-logs").classList.add("select")
    }
}

function logChannelOnChange(){
    changeData("logs",document.getElementById("logChannelSelect").value)
    console.log("Change")
}

function serverOnChange(){
    var commandsTable = [{"id":"commands-ban-checkbox","name":"ban"},{"id":"commands-kick-checkbox","name":"kick"},{"id":"commands-mute-checkbox","name":"mute"},{"id":"commands-clear-checkbox","name":"clear"},{"id":"commands-warn-checkbox","name":"warn"}]
    var select = document.getElementById("serverSelect")
    ipcRenderer.send("getGuildChannels", { "botId": parent.currentBotOpenId, "guildId" :select.value })
    if (select.value!="default"){
        var server = select.options[select.selectedIndex];
        //document.getElementById("save-config-div-result").style.display = "none"
        document.getElementById("fore-section").style.marginTop = "10vh"
        console.log(server.text)
        document.getElementById("serverNameTitle").innerHTML = server.text
        document.getElementById("serverNameTitle").style.opacity = 1

        for (var i in commandsTable){
            console.log(i)
            if (document.getElementById(commandsTable[i].id).checked){
                console.log("remove")
                document.getElementById(commandsTable[i].id).checked = false
            }
        }
        if (configData[select.value]){
            if (configData[select.value].commands){
                for (var i in commandsTable){
                    if (configData[select.value].commands[commandsTable[i].name]){
                        document.getElementById(commandsTable[i].id).checked = true;
                    }
                }
            }
            updateBadWordList()
        }
        
        openParameterDiv("commands")
    }
}

function changeData(type,data){
    var select = document.getElementById("serverSelect")
    if (type == "commands"){
        if (!configData[select.value]){
            configData[select.value] = {}
        }
        if (!configData[select.value].commands){
            configData[select.value].commands = {}
        }
        if (!configData[select.value].commands[data]){
            configData[select.value].commands[data] = false
        }
        configData[select.value].commands[data] = !configData[select.value].commands[data]
        saveConfig()
    }else{
        if (type == "logs"){
            if (!configData[select.value]){
                configData[select.value] = {}
            }
            if (!configData[select.value].logs){
                configData[select.value].logs = {}
            }
            configData[select.value].logs.channel = data
            console.log("save")
            saveConfig()
        }
    }
}

function returnToMenu(){
    document.getElementById("fore-section").style.marginTop = "100vh"
    document.getElementById("serverNameTitle").style.opacity = 0
}