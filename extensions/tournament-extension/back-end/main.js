var client,dataFolder,electron,prefix,user,location,ipcRenderer,intents
const fs = require("fs")
const path = require('path')

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

        client.on("message",async function(message){
        if (message.content.toLowerCase().startsWith(prefix+"tournoi")){
            console.log("intournoi")
      if (message.member.hasPermission("ADMINISTRATOR")){
        message.guild.members.fetch()
       console.log("inuser")
         var tournoiPrice = 0
       var roundReward = 0
       var winnerReward = 0
          var personPerZone = 5
          if (parseInt(message.content.split(" ")[1])){
            personPerZone = pareInt(message.content.split(" ")[1])
          }
        var TournoiKillerTable = JSON.parse(fs.readFileSync(location+"/back-end/commanddata/tournoi/killtext.json","utf8"))
            
          var tournoiStatus = "awaitPlayers"
          var usersInGame = []
          var totalUsers = []
          var infoUsers = {}
          var currentTournoiPlaces = []
          var tournoiFile = fs.readdirSync(location+"/back-end/commanddata/tournoi/universe")
          var tournoiPlaces = []
          for (i in tournoiFile){
                    console.log(tournoiPlaces)
            tournoiPlaces.push(JSON.parse(fs.readFileSync(location+"/back-end/commanddata/tournoi/universe/"+tournoiFile[i]),"utf8"))
          }
          var tournoiMessage = await message.channel.send({"embed":{
           title: "Un tournoi va bientôt commencer",
           description:"Un tournoi va commencer.\n\nAppuyez sur 💸 pour participer",
         }})
          await tournoiMessage.react("💸")
          await tournoiMessage.react("⏯️")
          var Collector =tournoiMessage.createReactionCollector((reaction,user)=>user.bot==false);
          Collector.on('collect', async(reaction) => {
            //console.log("reaction")
            if (reaction.emoji.toString()=="💸"){
              if (tournoiStatus == "awaitPlayers"){
                  var userAlreadyFound = false
                  for (i in usersInGame){
                    if (usersInGame[i] == reaction.users.cache.last().id) userAlreadyFound = true
                  }
                if (userAlreadyFound == false){
                  usersInGame.push(reaction.users.cache.last().id)
                  totalUsers.push(reaction.users.cache.last().id)
                  var messageEndDescription = "Joueurs: "
                  for (i in usersInGame) messageEndDescription+="<@"+usersInGame[i]+"> "
                    await tournoiMessage.edit({"embed":{
                     title: "Un tournoi va bientôt commencer",
                     description:"Un tournoi va commencer.\n\nAppuyez sur 💸 pour participer\n\n"+messageEndDescription,
                   }})
                }else{
                  var deleteMessage =await tournoiMessage.channel.send("<@"+reaction.users.cache.last().id+"> vous êtes déjà en jeu")
                  deleteMessage.delete({ timeout: 10000 })
                }
           }
         }
         if (reaction.emoji.toString()=="⏯️"){
          if (reaction.users.cache.last().id == message.author.id){
            console.log("id")
                    var todayText=["Le jour se lève, une bonne journée s'annonce sous quelques nuages et un grand soleil 🏞️","Le jour se lève, une journée nuageuse s'annonce aujourd'hui. Quelques averses peuvent arriver 🌄","Une journée pluvieuse s'annonce aujourd'hui, sortez les parapluies ☂️","Une journée mitigée entre averse et grand soleil s'annonce aujourd'hui, vous allez peut-être voir des arc-en-ciel 🌈","Il fait très beau aujourd'hui, très bonne journée pour aller se détendre sur la plage 🏖️"]
            var dayNumber = 0
            function delay(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            var choosePlacesText = ""
            var emojiList = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
                    console.log("emoj")
            var universeToChoose = tournoiPlaces[Math.floor(Math.random()*tournoiPlaces.length)]
                    console.log("uni",Math.ceil(usersInGame.length/personPerZone))
            for (var e =0;e<Math.ceil(usersInGame.length/personPerZone);e++){
                        console.log("push")
              currentTournoiPlaces.push({placeName:universeToChoose[e],playersInPlace:[],close:false})
              choosePlacesText+=emojiList[e]+" "+universeToChoose[e]+"\n"
                        console.log("pushf")
            }
                    console.log("clear")
            await  tournoiMessage.reactions.removeAll()
            await tournoiMessage.edit({"embed":{
              title: "Le tournoi commence",
              description:"Choisissez le lieu où vous allez atterir!\n\n"+choosePlacesText+"\n\n"+"Joueurs ayant choisi leur lieu:\n",
              image:{"url":"https://cdn.discordapp.com/attachments/677890389708898342/682185291213439031/30secondGif.gif"}
            }})
            for (var i in currentTournoiPlaces){
              await tournoiMessage.react(emojiList[i])
            }
            var isJoinFinish = false
            var Collector =tournoiMessage.createReactionCollector((reaction,user)=>user.bot==false);
            Collector.on('collect', async(reaction) => {
              for (i in emojiList){
                if (reaction.emoji.toString() == emojiList[i]){
                  var userFoundInPlayers = false
                  for (r in usersInGame){
                    if (usersInGame[r] == reaction.users.cache.last().id){
                      userFoundInPlayers = true
                    }
                  }
                                console.log("hey")
                  var userAlreadyFound = false
                  for (e in currentTournoiPlaces){
                    for (a in currentTournoiPlaces[e].playersInPlace){
                      if (currentTournoiPlaces[e].playersInPlace[a] == reaction.users.cache.last().id){
                        userAlreadyFound = true
                        //reaction.remove(reaction.users.cache.last())
                        var toDelMessage = await tournoiMessage.channel.send(reaction.users.cache.last()+", vous avez déjà choisi votre lieu d'atterrissage")
                        toDelMessage.delete({ timeout: 10000 })
                      }
                    }
                  }
                  if (userAlreadyFound == false && userFoundInPlayers == true){
                    currentTournoiPlaces[i].playersInPlace.push(reaction.users.cache.last().id)
                    //reaction.remove(reaction.users.cache.last())
                    tournoiMessage.edit({"embed":{
                      title: "Le tournoi commence",
                      description:tournoiMessage.embeds[0].description+"<@"+reaction.users.cache.last().id+"> ",
                      image:{"url":"https://cdn.discordapp.com/attachments/677890389708898342/682185291213439031/30secondGif.gif"}
                    }})
                  }else{
                    var toDelMessage = await tournoiMessage.channel.send(reaction.users.cache.last()+", vous ne vous êtes pas inscrit auparavant")
                    toDelMessage.delete({ timeout: 10000 })
                  }
                }
              }
            })
            await delay(30000) 
            var userDidntLaunch = false
            for (i in usersInGame){
              var userIn = false
              for (a in currentTournoiPlaces){
                for (e in currentTournoiPlaces[a].playersInPlace){
                  if (usersInGame[i] == currentTournoiPlaces[a].playersInPlace[e]){
                    userIn = true
                  }
                }
              }
              if (userIn == false){
                var randomTournoiPlace = currentTournoiPlaces[Math.floor(Math.random()*currentTournoiPlaces.length)]
                randomTournoiPlace.playersInPlace.push(usersInGame[i])
                userDidntLaunch = true
              }
            }
            if (userDidntLaunch == true){
              await tournoiMessage.channel.send({"embed":{
                title: "Choix du lieu automatique",
                description:"Certaines personnes s'étant inscrit n'ont pas choisis de lieu d'atterrissage. un lieu d'atterrissage leur à donc été attribué aléatoirement.",
              }})
              await delay(5000)
            }
            var messageEndDescription = "Zones ouvertes:\n "
            for (i in currentTournoiPlaces){
              if (currentTournoiPlaces[i].close){
                messageEndDescription+="~~"+currentTournoiPlaces[i].placeName+"~~ (Zone fermée)"
              }else{
                messageEndDescription+="**"+currentTournoiPlaces[i].placeName+"**: "
              }
              for (a in currentTournoiPlaces[i].playersInPlace){
               messageEndDescription+="<@"+currentTournoiPlaces[i].playersInPlace[a]+"> "
             }
             messageEndDescription+="\n"
           }
           await tournoiMessage.channel.send({"embed":{
            title: "Le tournoi commence!",
            description:messageEndDescription,
          }})
           await delay(5000)
           isJoinFinish = true
           function getAllUserInTournoi(){
            var users = []
            for (e in currentTournoiPlaces){
              for (a in currentTournoiPlaces[e].playersInPlace){
                users.push(currentTournoiPlaces[e].playersInPlace[a])
              }
            }
            return users
          }
          while (usersInGame.length!=1){
            var todayInfo = []
            //console.log("While")
            dayNumber++
            tournoiMessage.channel.send({"embed":{
              title: "🌇 Jour "+dayNumber,
              description:todayText[Math.floor(Math.random()*todayText.length)],
            }})
            await delay(5000)
                    console.log(TournoiKillerTable)
                    for (var i in currentTournoiPlaces){
                        console.log(currentTournoiPlaces[i])
              var choose = Math.random()*2
              if (currentTournoiPlaces[i].playersInPlace.length>1){
                            console.log("1")
                var textKillChoose = TournoiKillerTable[Math.floor(Math.random()*TournoiKillerTable.length)]
                var killedIndex = Math.floor(Math.random()*currentTournoiPlaces[i].playersInPlace.length)
                var killed = currentTournoiPlaces[i].playersInPlace[killedIndex]
                currentTournoiPlaces[i].playersInPlace.splice(killedIndex,1)
                var killer = currentTournoiPlaces[i].playersInPlace[Math.floor(Math.random()*currentTournoiPlaces[i].playersInPlace.length)]
                usersInGame=getAllUserInTournoi()
                            console.log("getuser")
                //console.log(currentTournoiPlaces)
                //console.log(i)
                tournoiMessage.channel.send({"embed":{
                  title: currentTournoiPlaces[i].placeName,
                  description:"⚔️ **Personne tuée**\n\n"+textKillChoose.description.replace("{killer}",tournoiMessage.guild.members.cache.get(killer)).replace("{user}",tournoiMessage.guild.members.cache.get(killed))+"\n\nIl reste encore "+usersInGame.length+" survivants"
                }})
                if (!infoUsers[killer]) infoUsers[killer]={}
                  if (!infoUsers[killed]) infoUsers[killed]={}
                    if (!infoUsers[killer].kills) infoUsers[killer].kills = 0
                      infoUsers[killer].kills ++
                    if (infoUsers[killer].kills>2){
                      todayInfo.push("<@"+tournoiMessage.guild.members.cache.get(killer)+"> est dans une série de "+infoUsers[killer].kills+" kills! Qui peut l'arréter?")
                    }
                    infoUsers[killed].killText = textKillChoose.killText.replace("{killer}",tournoiMessage.guild.members.cache.get(killer))
                    infoUsers[killed].position = usersInGame.length+1
                    if (!infoUsers[killed].kills) infoUsers[killed].kills = 0
                      if (infoUsers[killed].kills>2){
                        todayInfo.push("<@"+tournoiMessage.guild.members.cache.get(killed)+"> a arrété sa série de "+infoUsers[killed].kills+" kills car il a été tué par <@"+tournoiMessage.guild.members.cache.get(killer)+">. RIP")
                      }
                      await delay(8000)
                    }else{
                                        console.log("else")
                      if (currentTournoiPlaces[i].playersInPlace.length == 1){
                                            console.log("interieur")
                                            tournoiMessage.channel.send({"embed":{
                        title: currentTournoiPlaces[i].placeName,
                        description:"📌 **Pas d'évènement**\n\nIl ne s'est rien passé dans cet endroit..."
                      }})
                      await delay(8000)
                    }
                  }
                }
                if (todayInfo.length==0){
                 
                }else{
                  for (i in todayInfo){
                   tournoiMessage.channel.send({"embed":{
                    title: "🗨️ Point info!",
                    description: todayInfo[i],
                  }})
                   await delay(3000)
                 }
               }
               if (dayNumber % 2 == 0 && getAllUserInTournoi().length!=1){
                var placeToClose = ""
                var playerToSend = ""
                var move = false
                for (i in currentTournoiPlaces){
                  if (currentTournoiPlaces[i].playersInPlace.length == 1 && placeToClose == "" && currentTournoiPlaces[i].close == false){
                    placeToClose+="**"+currentTournoiPlaces[i].placeName+"**\n"
                    currentTournoiPlaces[i].close = true
                    playerToSend = currentTournoiPlaces[i].playersInPlace[0]
                    currentTournoiPlaces[i].playersInPlace = []
                    move = true
                    break
                  }
                }
                for (i in currentTournoiPlaces){
                  if (currentTournoiPlaces[i].close == false && move == true){
                    currentTournoiPlaces[i].playersInPlace.push(playerToSend)
                    placeToClose+="<@"+playerToSend+">"+" a donc rejoint la zone suivante: "+currentTournoiPlaces[i].placeName
                    break
                  }
                }
                if (move == true){
                  await tournoiMessage.channel.send({"embed":{
                    title: "Fermeture de zone!",
                    description: "La zone suivante va se fermer: "+placeToClose,
                    image:{"url":"https://cdn.discordapp.com/attachments/677890389708898342/682508815630860308/closingZone.gif"}
                  }})
    
                  await delay(5000)
                }
              }
                        if (currentTournoiPlaces.filter(place=>place.close==false).length>1){
              choosePlacesText = ""
              var emojiList = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
              for (i in currentTournoiPlaces){
                if (currentTournoiPlaces[i].close==false){
                  choosePlacesText+=emojiList[i]+" "+currentTournoiPlaces[i].placeName+"\n"
                }
              }
              var movementMessage = await message.channel.send({"embed":{
                title: "Déplacement",
                description:"Vous voulez vous déplacer? Choisissez votre prochain lieu\n\n"+choosePlacesText+"\n\n"+"Joueurs ayant choisi leur lieu:\n",
                image:{"url":"https://cdn.discordapp.com/attachments/677890389708898342/682185291213439031/30secondGif.gif"}
              }})
    
              for (var i in currentTournoiPlaces){
               if (currentTournoiPlaces[i].close==false)  {
                await movementMessage.react(emojiList[i])
              }
            }
            var userMove = {}
            var changeZoneDescription = ""
            var movementFinish = false
                    
            var Collector =movementMessage.createReactionCollector((reaction,user)=>user.bot==false);
            Collector.on('collect', async(reaction) => {
              for (i in emojiList){
                if (reaction.emoji.toString() == emojiList[i] && movementFinish == false ){
                  for (r in usersInGame){
                    if (usersInGame[r]==reaction.users.cache.last().id){
                      for (e in currentTournoiPlaces){
                        for (a in currentTournoiPlaces[e].playersInPlace){
                          if (currentTournoiPlaces[e].playersInPlace[a] == usersInGame[r]){
                            currentTournoiPlaces[e].playersInPlace.splice(a,1)
                            //console.log("CurrentlyInZone")
                          }
                        }
                      }
                      if (!userMove[reaction.users.cache.last().id]){
                        changeZoneDescription+=" <@"+reaction.users.cache.last().id+">"
    
                      }
                      userMove[reaction.users.cache.last().id] = currentTournoiPlaces[i].placeName
                      var userMoveToText = ""
    
                      movementMessage.edit({"embed":{
                        title: "Déplacement",
                        description:"Vous voulez vous déplacer? Choisissez votre prochain lieu\n\n"+choosePlacesText+"\n\n"+"Joueurs ayant choisi leur lieu:\n"+changeZoneDescription,
                        image:{"url":"https://cdn.discordapp.com/attachments/677890389708898342/682185291213439031/30secondGif.gif"}
                      }})
                      
                      currentTournoiPlaces[i].playersInPlace.push(usersInGame[r])
                      //console.log("Deplacement")
                    }
    
                  }
                }
              }
            })
            await delay(10000)
    
            changeZoneDescription =""
            movementFinish = true
            for (i in usersInGame){
              if (userMove[usersInGame[i]]){
                changeZoneDescription+="<@"+usersInGame[i]+"> se déplace vers "+userMove[usersInGame[i]]+"\n"
              }
            }
            await tournoiMessage.channel.send({"embed":{
              title: "Changements de zones",
              description:"Certains joueurs se sont déplacés vers d'autres zones:\n\n"+changeZoneDescription,
            }})
            await delay(5000)
                    }
            var messageEndDescription = "__Joueurs encore vivants:__\n "
            for (i in currentTournoiPlaces){
              if (currentTournoiPlaces[i].close){
                messageEndDescription+="~~"+currentTournoiPlaces[i].placeName+"~~ (Zone fermé)"
              }else{
                messageEndDescription+="**"+currentTournoiPlaces[i].placeName+"**: "
              }
              for (a in currentTournoiPlaces[i].playersInPlace){
               messageEndDescription+="<@"+currentTournoiPlaces[i].playersInPlace[a]+"> "
             }
             messageEndDescription+="\n"
           }
           tournoiMessage.channel.send({"embed":{
            title: "🌃 Fin du jour "+dayNumber,
            description:"Le jour se lève dans 15 secondes...\n\n"+messageEndDescription,
          }})
           usersInGame = getAllUserInTournoi()
           await delay(15000)
             // if (dayNumber % timeForSpectatorChoice == 0){
    
             // }
           }
           tournoiMessage.channel.send({"embed":{
            title: "Fin du tournoi",
            description:"Le grand gagnant est <@"+tournoiMessage.guild.members.cache.get(usersInGame[0])+">" }})
            if (!infoUsers[usersInGame[0]]) infoUsers[usersInGame[0]]={}
            infoUsers[usersInGame[0]].killText="Grand champion, vous avez été tué par personne!"
          infoUsers[usersInGame[0]].position = 1
         var finalClassement=""
         totalUsers.sort(function (a, b) {
          return (infoUsers[a].position) - (infoUsers[b].position) ;
        });
         for (i in totalUsers) finalClassement+=(parseInt(i)+1)+". <@"+totalUsers[i]+">\n"
           for (i in totalUsers){
             tournoiMessage.guild.members.cache.get(totalUsers[i]).send({embed:{
              title: "Statistique de tournoi",
              description:"Le tournoi auquel vous avez participé vient juste de ce terminer",
              fields:[
              {
                name:"Votre place",
                value:"Vous vous êtes classé "+infoUsers[totalUsers[i]].position+"/"+totalUsers.length,
                inline:true
              },
              {
                name:"Kills",
                value:"Vous avez fait un total de "+infoUsers[totalUsers[i]].kills+" kills",
                inline:true
              },
              {
                name:"Tueur",
                value:infoUsers[totalUsers[i]].killText,
                inline:true
              },
              {
                name:"Classement final",
                value:finalClassement,
                inline:true
              },
              ],
    
            }})
           }
         }else{
           message.author.send("<@"+reaction.users.cache.last().id+"> a essayé d'activer le tournoi")
         }
       }
    
     })
    }
}
        })
    }
}