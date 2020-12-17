var client,dataFolder,electron,prefix,user,BrowserWindow,location,giveawayData,ipcRenderer,intents,thisExtensionStartHosting,Notification
const fs = require("fs")
const path = require('path')
const ytdl = require("ytdl-core")
const ytsr = require('ytsr');

var musicList = {}

function addMusic(server,channel,music){
    if (!musicList[server.id]){
        musicList[server.id] = {"loop":false,"queue":[],"channel":channel.id}
    }
    musicList[server.id].queue.push(music)
    if (musicList[server.id].queue.length == 1){
        play(server)
    }
}

function play(server){
    var music = musicList[server.id].queue[0]
    if (music && client.guilds.cache.get(server.id).me.voice.connection){
        var dispatcher = client.guilds.cache.get(server.id).me.voice.connection.play(ytdl(music.link))
        client.channels.cache.get(musicList[server.id].channel).send("⏯️ Je joue maintenant: "+music.title+" par "+music.author.name)
        musicList[server.id].dispatcher = dispatcher
        if (client.guilds.cache.get(server.id).me.voice.channel.members.has(user)){
            new Notification({
                "title":"Musique",
                "body":"Je joue maintenant la musique: "+music.title
            }).show()
        }
        dispatcher.on("finish",function(){
            if (musicList[server.id].loop == false){
                musicList[server.id].queue.splice(0,1)
            }
            if (musicList[server.id].queue.length != 0){
                play(server)
            }
        })
        dispatcher.on("error",function(e){
            console.log(e)
        })
    }
}

module.exports = {
    start(){
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
        Notification = electron.Notification
        client.on("voiceStateUpdate",function(oldS,newS){
            console.log(newS.id,client.id,newS.connection)
            if (newS.id == client.user.id){
                if (!newS.connection){
                    var containsMusic = false
                    if (musicList[newS.guild.id]){
                        if (musicList[newS.guild.id].queue.length>=1){
                            containsMusic = true
                            musicList[newS.guild.id].queue = []
                            if (musicList[newS.guild.id].dispatcher){
                                musicList[newS.guild.id].dispatcher.end()
                            }
                        }
                    }
                    if (containsMusic){
                        client.channels.cache.get(musicList[newS.guild.id].channel).send("La queue a été vidée comme je viens de quitter le salon")
                    }
                }
            }
        })
        client.on("message",async function(message){
            if (message.content.startsWith(prefix+"play")){
                if (message.member.voice.channel){
                    console.log(message.content)
                    if (message.content.split(" ")[1]){
                        if (!message.guild.me.voice.connection){
                            message.channel.send("🔊 Je rejoins le salon vocal")
                            await message.member.voice.channel.join()
                        }
                        message.channel.send("🔍 Recherche de **"+message.content.split(prefix+"play")[1]+"**")
                        var ytResult = await ytsr(message.content.split(prefix+"play")[1],{limit:15})
                        var sResult = ytResult.items.filter(item=>item.type=="video");
                        sResult = sResult[0]
                        console.log(sResult)
                        //console.log(sResult)
                        message.channel.send("👍 Musique ajoutée dans la queue: "+sResult.title+" par "+sResult.author.name)
                        addMusic(message.guild,message.channel,sResult)
                    }else{
                        message.channel.send("Vous devez ajouter le nom de votre musique à la fin de cette commande.")
                    }
                }else{
                    message.channel.send("Vous devez être dans un salon vocal pour utiliser cette commande.")
                }
            }
            if (message.content.startsWith(prefix+"queue")){
                if (musicList[message.guild.id] && musicList[message.guild.id].queue.length>=1){
                    var totalText = ""
                    for (var i in musicList[message.guild.id].queue){
                        totalText += (parseInt(i)+1)+". `"+ musicList[message.guild.id].queue[i].title+"`, durée: "+musicList[message.guild.id].queue[i].duration+"\n"
                    }
                    message.channel.send(totalText)
                }else{
                    message.channel.send("Je ne joue aucune musique dans ce serveur")
                }
            }
            if (message.content.startsWith(prefix+"loop")){
                if (message.member.voice.channel){
                    if (musicList[message.guild.id] && musicList[message.guild.id].queue.length>=1){
                        if (musicList[message.guild.id].loop){
                            musicList[message.guild.id].loop = false
                            message.channel.send("🔁 Musique en boucle désactivée")
                        }else{
                            musicList[message.guild.id].loop = true
                            message.channel.send("🔁 Musique en boucle activée")
                        }
                    }else{
                        message.channel.send("Impossible de jouer la musique en boucle: Aucune musique joue")
                    }
                }else{
                    message.channel.send("Vous devez être dans un salon vocal pour utiliser cette commande.")
                }
            }
            if (message.content.startsWith(prefix+"leave")){
                if (message.member.hasPermission("ADMINISTRATOR")){
                    if (message.guild.me.voice.connection){
                        await message.guild.me.voice.connection.disconnect()
                        message.channel.send(":wave: Déconnexion effectuée")
                    }else{
                        message.channel.send("Je ne suis pas dans un salon vocal")
                    }
                }else{
                    message.channel.send("Vous devez avoir la permission Administrateur pour me faire quitter le salon")
                }
            }
            if (message.content.startsWith(prefix+"skip")){
                if (message.member.voice.channel){
                    if (musicList[message.guild.id] && musicList[message.guild.id].queue.length>=1){
                        message.channel.send("⏭️ Musique skipée!")
                        if (musicList[message.guild.id].dispatcher){
                            musicList[message.guild.id].dispatcher.end()
                        }
                    }else{
                        message.channel.send("Impossible de skip la musique: Aucune musique joue")
                    }
                }else{
                    message.channel.send("Vous devez être dans un salon vocal pour utiliser cette commande.")
                }
            }
            if (message.content.startsWith(prefix+"pause")){
                if (message.member.voice.channel){
                    if (musicList[message.guild.id] && musicList[message.guild.id].dispatcher){
                        if (musicList[message.guild.id].dispatcher.paused){
                            message.channel.send("La musique est déjà en pause")
                        }else{
                            message.channel.send("⏯️ Musique mise en pause")
                            musicList[message.guild.id].dispatcher.pause()
                        }
                    }else{
                        message.channel.send("Je ne suis pas en train de jouer de la musique")
                    }
                }else{
                    message.channel.send("Vous devez être dans un salon vocal pour utiliser cette commande.")
                }
            }
            if (message.content.startsWith(prefix+"resume")){
                if (message.member.voice.channel){
                    if (musicList[message.guild.id] && musicList[message.guild.id].dispatcher){
                        if (musicList[message.guild.id].dispatcher.paused){
                            message.channel.send("⏯️ Je reprends la musique!")
                            musicList[message.guild.id].dispatcher.resume()
                        }else{
                            message.channel.send("La musique est déjà en train de jouer")
                        }
                    }else{
                        message.channel.send("Je ne suis pas en train de jouer de la musique")
                    }
                }else{
                    message.channel.send("Vous devez être dans un salon vocal pour utiliser cette commande.")
                }
            }
        })
        //setInterval(updateGiveaway,10000)
    }
}