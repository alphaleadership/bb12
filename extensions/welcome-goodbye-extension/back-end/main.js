var client,dataFolder,electron
const fs = require("fs")
module.exports = {
    start(){
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        var configData = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8"))
        console.log(configData)
        console.log(client.guilds.cache.array().length)
        client.on("guildMemberAdd",async function(member){
            if (configData[member.guild.id] && configData[member.guild.id].welcome.channel != "default"){
                if (member.guild.channels.cache.has(configData[member.guild.id].welcome.channel)){
                    var thisChannel = member.guild.channels.cache.get(configData[member.guild.id].welcome.channel)
                    var messageToSend = configData[member.guild.id].welcome.message
                    await member.guild.members.fetch()
                    messageToSend=messageToSend.replace("{member}","<@"+member.id+">").replace("{membercount}",member.guild.members.cache.array().length)
                    thisChannel.send(messageToSend)
                }
            }
        })
        client.on("guildMemberRemove",async function(member){
            if (configData[member.guild.id] && configData[member.guild.id].goodbye.channel != "default"){
                if (member.guild.channels.cache.has(configData[member.guild.id].goodbye.channel)){
                    var thisChannel = member.guild.channels.cache.get(configData[member.guild.id].goodbye.channel)
                    var messageToSend = configData[member.guild.id].goodbye.message
                    messageToSend=messageToSend.replace("{member}","<@"+member.id+">").replace("{membercount}",member.guild.members.cache.array().length)
                    thisChannel.send(messageToSend)
                }
            }
        })
        client.on("message",async function(message){
            if (message.member.hasPermission("ADMINISTRATOR")){
                if (message.content.startsWith(prefix+"testjoin")){
                    if (configData[message.member.guild.id] && configData[message.member.guild.id].welcome.channel != "default"){
                        if (message.member.guild.channels.cache.has(configData[message.member.guild.id].welcome.channel)){
                            var thisChannel = message.member.guild.channels.cache.get(configData[message.member.guild.id].welcome.channel)
                            var messageToSend = configData[message.member.guild.id].welcome.message
                            await message.member.guild.members.fetch()
                            messageToSend=messageToSend.replace("{member}","<@"+message.member.id+">").replace("{membercount}",message.member.guild.members.cache.array().length)
                            thisChannel.send(messageToSend)
                        }
                    }else{
                        message.channel.send("Vous n'avez pas configuré les join dans ce serveur")
                    }
                }
                if (message.content.startsWith(prefix+"testleave")){
                    if (configData[message.member.guild.id] && configData[message.member.guild.id].goodbye.channel != "default"){
                        if (message.member.guild.channels.cache.has(configData[message.member.guild.id].goodbye.channel)){
                            var thisChannel = message.member.guild.channels.cache.get(configData[message.member.guild.id].goodbye.channel)
                            var messageToSend = configData[message.member.guild.id].goodbye.message
                            messageToSend=messageToSend.replace("{member}","<@"+message.member.id+">").replace("{membercount}",message.member.guild.members.cache.array().length)
                            thisChannel.send(messageToSend)
                        }
                    }else{
                        message.channel.send("Vous n'avez pas configuré les leave dans ce serveur")
                    }
                }
            }
        })
    }
}