var client,dataFolder,electron,prefix,user,BrowserWindow,location,giveawayData,ipcRenderer,intents,thisExtensionStartHosting
const fs = require("fs")
const path = require('path')
var isGiveawayWindowOpen = false
var giveawayEmbed = {
    "title":"Giveaway",
    "description":"À gagner: **__{reward}__**\n{winnersNum} gagnant(s)\n{constraintText}\nSe termine le **{dayFinish} à {hourFinish}**\n\nRéagissez avec 🎉 pour participer à ce giveaway"
}
var giveawayWinEmbed = {
    "title":"Giveaway",
    "description":"À gagner: **__{reward}__**\n\nLes gagnants sont: {winners}"
}
var giveawayAlreadyCreate = []
module.exports = {
    start(){
        isGiveawayWindowOpen = false
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        user = this.user
        prefix = this.prefix
        location = this.location
        intents = this.intents
        ipcRenderer = electron.ipcMain
        thisExtensionStartHosting = true
        BrowserWindow = electron.BrowserWindow
        var configData = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8"))

        var giveaways = {}

        
        ipcRenderer.on("giveaway-extension-getGiveawayData",function(event){
            console.log("Receive")
            event.sender.send("giveaway-extension-getGiveawayData",giveawayData)
        })

        ipcRenderer.on("giveaway-extension-get-roles",function(event,guild){
            if (client.guilds.cache.has(guild)){
                var roles = client.guilds.cache.get(guild).roles.cache.array()
                var rolesToReturn = []
                for (var i in roles){
                    rolesToReturn.push({id:roles[i].id,name:roles[i].name})
                }
                event.returnValue = rolesToReturn
            }
        })

        ipcRenderer.on("giveaway-extension-get-guilds",function(event,guild){
            var guilds = client.guilds.cache.array()
            var guildsToReturn = []
            for (var i in guilds){
                if (guilds[i].id!=guild){
                    guildsToReturn.push({id:guilds[i].id,name:guilds[i].name})
                }
            }
            event.returnValue = guildsToReturn
        })

        ipcRenderer.on("giveaway-extension-create-giveaway", async function(event,data){
            if (!giveawayAlreadyCreate.find(ga=>ga == data.id)){
                giveawayAlreadyCreate.push(data.id)
                var monthTable = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
                console.log(Date.now()-data.time)
                if (client.channels.cache.has(data.channel)){
                    var channel = client.channels.cache.get(data.channel)
                    var thisGiveawayEmbed = JSON.parse(JSON.stringify(giveawayEmbed))
                    thisGiveawayEmbed.description = thisGiveawayEmbed.description.replace("{reward}",data.reward)
                    thisGiveawayEmbed.description = thisGiveawayEmbed.description.replace("{winnersNum}",data.winnerNumber)
                    var date = new Date(data.time)
                    thisGiveawayEmbed.description = thisGiveawayEmbed.description.replace("{dayFinish}",date.getDate()+" "+monthTable[date.getMonth()])
                    thisGiveawayEmbed.description = thisGiveawayEmbed.description.replace("{hourFinish}",date.getHours()+":"+date.getMinutes())
                    var constraintText
                    if (data.constraint.type == "none"){
                        constraintText = ""
                    }else{
                        if (data.constraint.type == "role"){
                            constraintText = "Pour participer, vous devez avoir le rôle: <@&"+data.constraint.value+">\n"
                        }else{
                            constraintText = "Pour participer, vous devez faire partie du serveur: "+client.guilds.cache.get(data.constraint.value).name+"\n"
                        }
                    }
                    thisGiveawayEmbed.description = thisGiveawayEmbed.description.replace("{constraintText}",constraintText)
                    var messageSent = await channel.send({"embed":thisGiveawayEmbed})
                    channel.guild.members.fetch()
                    messageSent.react("🎉")
                    data.message = messageSent.id
                    data.status = "waitingEnd"
                    data.users = []
                    giveaways[data.message] = {"users":[],"constraint":data.constraint,"inscriptionMessage":data.inscriptionMessage}
                    setTimeout(function(){
                    	if (client.channels.cache.has(data.channel)){
                            var thisChannel = client.channels.cache.get(data.channel)
                            thisChannel.messages.fetch(data.message)
                            .then(async function(messageSent){
                            	if (!messageSent.deleted){
	                                var winners = []
	                                for (var a=0;a<data.winnerNumber;a++){
	                                    winners.push(giveaways[data.message].users[Math.floor(Math.random()*giveaways[data.message].users.length)])
	                                }
	                                await thisChannel.send("Giveaway terminé!\nLes gagnants sont: <@"+winners.join(">, <@")+">")
	                                var embedWinner = JSON.parse(JSON.stringify(giveawayWinEmbed))
	                                embedWinner.description = embedWinner.description.replace("{reward}",data.reward)
	                                embedWinner.description = embedWinner.description.replace("{winners}","<@"+winners.join(">, <@")+">")
	                                await messageSent.edit({embed:embedWinner})
	                                await messageSent.react("🔁")
                                }
                            })
                        }
                    },data.time-Date.now())
                }
            }
        })

        client.on('messageReactionAdd', async (reaction, userReact) => {
            console.log("react")
            if (reaction.emoji.name == "🎉" && !userReact.bot){
                console.log("name")
                if (giveaways[reaction.message.id]){
                    console.log("find")
                    var thisGiveaway = giveaways[reaction.message.id]
                    if (thisGiveaway && !thisGiveaway.users.find(gauser=>gauser == userReact.id)){
                        console.log("giveawayFind")
                        if (thisGiveaway.constraint.type == "none"){
                            thisGiveaway.users.push(userReact.id)
                            userReact.send(thisGiveaway.inscriptionMessage)
                        }else{
                            if (thisGiveaway.constraint.type == "role"){
                                var member = reaction.message.guild.members.cache.get(userReact.id)
                                await member.fetch()
                                if (member.roles.cache.has(thisGiveaway.constraint.value)){
                                    thisGiveaway.users.push(userReact.id)
                                    userReact.send(thisGiveaway.inscriptionMessage)
                                }else{
                                    userReact.send("Vous ne pouvez pas rejoindre le giveaway car vous n'avez pas le rôle requis")

                                }
                            }else{
                                if (client.guilds.cache.has(thisGiveaway.constraint.value)){
                                    var guildToJoin = client.guilds.cache.get(thisGiveaway.constraint.value)
                                    await guildToJoin.members.fetch()
                                    console.log(guildToJoin.members.cache.has(userReact.id))
                                    if (guildToJoin.members.cache.has(userReact.id)){
                                        thisGiveaway.users.push(userReact.id)
                                        userReact.send(thisGiveaway.inscriptionMessage)
                                    }else{
                                        userReact.send("Vous ne pouvez pas rejoindre le giveaway car vous n'avez pas rejoint le serveur")
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                if (reaction.emoji.name == "🔁" && !userReact.bot){
                    if (user == userReact.id){
                        if (giveaways[reaction.message.id]){
                            var thisGiveaway = giveaways[reaction.message.id]
                            var newWinner = thisGiveaway.users[Math.floor(Math.random()*thisGiveaway.users.length)]
                            reaction.message.channel.send("Reroll effectué. Le nouveau gagnant est: <@"+newWinner+">")
                        }
                    }
                }
            }
        })
        client.on("message",function(message){
            if (message.content.startsWith(prefix+"giveaway") && isGiveawayWindowOpen == false){
                if (user!=message.author.id) return message.channel.send("Vous n'êtes pas en train de controller le bot, vous ne pouvez donc pas faire de giveaways")
                mainWindow = new BrowserWindow({
                    width: 460,
                    height: 680,
                    center: true,
                    transparent:true,
                    frame:false,
                    webPreferences: {
                      preload: path.join(__dirname, 'preload.js')
                    }
                  })
                  mainWindow.setAlwaysOnTop(true); 
                  setTimeout(() => {
                      mainWindow.setAlwaysOnTop(false); 
                  }, 1000);
                  mainWindow.loadFile(location+'/back-end/windowFiles/index.html')
                  mainWindow.setMenu(null)
                  isGiveawayWindowOpen = true
                  mainWindow.on("close",function(){
                        isGiveawayWindowOpen = false
                  })
                  //mainWindow.webContents.openDevTools()
                  giveawayData = {"guild":{"id":message.guild.id,"name":message.guild.name},"channel":message.channel.id,"id":Date.now()}
                  ipcRenderer.once("giveaway-extension-close-giveaway",function(){
                        mainWindow.close()
                  })
                  ipcRenderer.once("giveaway-extension-create-giveaway", async function(event,data){
                        mainWindow.close()
                  })
                  message.channel.send("Une fenêtre vient de s'ouvrir sur votre ordinateur. Vous pouvez créer votre giveaway dessus!")
            }
        })
        async function updateGiveaway(){
                var totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                for (var i in totalGiveaway){
                    var thisGiveaway = totalGiveaway[i]
                    if (thisGiveaway && thisGiveaway.status != "finish" && thisGiveaway.time<Date.now()){
                        var currentSave = JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                        if (currentSave.find(ga=>thisGiveaway.message == ga.message) && currentSave.find(ga=>thisGiveaway.message == ga.message).status!="finish"){
                        if (client.channels.cache.has(thisGiveaway.channel)){
                            var thisChannel = client.channels.cache.get(thisGiveaway.channel)
                            var thisGiveawayIndex = i
                            thisChannel.messages.fetch(thisGiveaway.message)
                            .then(async function(messageSent){
                            	if (!messageSent.deleted){
	                                var winners = []
	                                totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
	                                thisGiveaway = totalGiveaway.find(ga=>ga.message == messageSent.id)
	                                for (var a=0;a<totalGiveaway[i].winnerNumber;a++){
	                                    winners.push(totalGiveaway[i].users[Math.floor(Math.random()*totalGiveaway[i].users.length)])
	                                }
	                                thisGiveaway.status = "finish"
	                                fs.writeFileSync(dataFolder+'/bot-data/giveaways.json',JSON.stringify(totalGiveaway))
	                                await thisChannel.send("Giveaway terminé!\nLes gagnants sont: <@"+winners.join(">, <@")+">")
	                                var embedWinner = JSON.parse(JSON.stringify(giveawayWinEmbed))
	                                embedWinner.description = embedWinner.description.replace("{reward}",thisGiveaway.reward)
	                                embedWinner.description = embedWinner.description.replace("{winners}","<@"+winners.join(">, <@")+">")
	                                await messageSent.edit({embed:embedWinner})
	                                await messageSent.react("🔁")
                            	}else{
                            		totalGiveaway.splice(thisGiveawayIndex,1)
                            		totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                            	}
                            })
                            .catch(function(e){
                            	totalGiveaway.splice(thisGiveawayIndex,1)
                            	totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                            })
                        }else{
                        	totalGiveaway.splice(i,1)
                        	totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                        }
                    }else{
                        if (thisGiveaway.time+24*60*60000< Date.now()){
                            totalGiveaway.splice(i,1)
                            totalGiveaway =  JSON.parse(fs.readFileSync(dataFolder+"/bot-data/giveaways.json"))
                        }
                    }
                }
            }
        }
        function start(){
            
        }
        start()
        //setInterval(updateGiveaway,10000)
    }
}