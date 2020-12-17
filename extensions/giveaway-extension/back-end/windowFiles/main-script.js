var optionElement = `<option value="{value}">{inner}</option>`

ipcRenderer.send("giveaway-extension-getGiveawayData","")
console.log("Sent")
var giveawayData 
ipcRenderer.on("giveaway-extension-getGiveawayData",function(event,data){
    document.getElementById("giveawaySection").classList.remove("disappear")
    console.log("Receive")
    giveawayData = data
    document.getElementById("giveawaySubtitle").innerHTML = "Création d'un giveaway sur le serveur: "+data.guild.name
})
function closeGiveaway(){
    document.getElementById("giveawaySection").classList.add("disappear")
    setTimeout(function(){
        ipcRenderer.send("giveaway-extension-close-giveaway")
    },700)
}
function constraint_change(){
    var contrainte = document.getElementById("contrainte").value
    if (contrainte == "no-contraint"){
        document.getElementById("contrainte-value").style.display = "none"
    }else{
        document.getElementById("contrainte-value").style.display = "block"
        document.getElementById("contrainte-value").innerHTML = ""
        if (contrainte == "role"){
            var roles = ipcRenderer.sendSync("giveaway-extension-get-roles",giveawayData.guild.id)
            for (var i in roles){
                document.getElementById("contrainte-value").innerHTML+=optionElement.replace("{value}",roles[i].id).replace("{inner}",roles[i].name)
            }
        }
        if (contrainte == "guild"){
            var guilds = ipcRenderer.sendSync("giveaway-extension-get-guilds",giveawayData.guild.id)
            for (var i in guilds){
                document.getElementById("contrainte-value").innerHTML+=optionElement.replace("{value}",guilds[i].id).replace("{inner}",guilds[i].name)
            }
        }
    }
}
function createGiveaway(){
    console.log(document.getElementById("giveaway-date-input").value)
    var data = {}
    var time = (new Date(document.getElementById("giveaway-date-input").value)).getTime()
    data.time = time
    if (!document.getElementById("giveaway-reward-input").value){
        data.reward = "Un cookie"
    }else{
        data.reward = document.getElementById("giveaway-reward-input").value
    }
    if (!document.getElementById("giveaway-winner-number").value){
        data.winnerNumber = 1
    }else{
        data.winnerNumber = document.getElementById("giveaway-winner-number").value
    }
    if (!document.getElementById("giveaway-winner-message").value){
        data.inscriptionMessage = "Vous faites maintenant partie du giveaway"
    }else{
        data.inscriptionMessage = document.getElementById("giveaway-winner-message").value
    }
    var contrainte = document.getElementById("contrainte").value
    if (contrainte == "no-contraint"){
        data.constraint = {"type":"none"}
    }else{
        data.constraint = {"type":contrainte,"value":document.getElementById("contrainte-value").value}
    }
    data.channel = giveawayData.channel
    data.id = giveawayData.id
    ipcRenderer.send("giveaway-extension-create-giveaway",data)
}