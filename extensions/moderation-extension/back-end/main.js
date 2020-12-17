var client,dataFolder,electron,prefix,location,warns
const fs = require("fs")
var embeds,configData
var logsData = [{"name":"{member}",id:"member"},{"name":"{channelName}",id:"channelName"},{"name":"{channel}",id:"channel"},{"name":"{messageAuthor}",id:"messageAuthor"},{"name":"{messageContent}",id:"messageContent"},{"name":"{role}",id:"role"},{"name":"{roleName}",id:"roleName"},{"name":"{emojiName}",id:"emojiName"}]
var deleteMessage = {}
function badWordFound(totalBadWord,content){
    var charToEscape = [",",".","!","/","?","*","_","~"]
    content = content.toLowerCase();
    for (var i in charToEscape){
        while (content.includes(charToEscape[i])){
            content = content.replace(charToEscape[i],"")
        }
    }
    for (var i in totalBadWord){
        totalBadWord[i] = totalBadWord[i].toLowerCase()
        if (content == totalBadWord[i] || content.startsWith(totalBadWord[i]+" ") || content.endsWith(" "+totalBadWord[i]) || content.includes(" "+totalBadWord[i]+" ")){
            return true
        }
    }
    return false
}

function sendLog(server,type,data){
    if (configData[server] && configData[server].logs && configData[server].logs.channel!="default"){
        var thisEmbed = JSON.parse(JSON.stringify(embeds.logs[type]))
        for (var i in logsData){
            while (thisEmbed.description.includes(logsData[i].name)){
                thisEmbed.description= thisEmbed.description.replace(logsData[i].name,data[logsData[i].id])
            }
        }
        if (client.channels.cache.has(configData[server].logs.channel)){
            client.channels.cache.get(configData[server].logs.channel).send({embed:thisEmbed})
        }
    }
}
module.exports = {
    start(){
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        prefix = this.prefix
        location = this.location
        embeds =  JSON.parse(fs.readFileSync(location+"/back-end/embeds.json","utf-8"))
        configData = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8"))
        if (fs.existsSync(dataFolder+"/bot-data/warns.json")){
            warns = JSON.parse(fs.readFileSync(dataFolder+"/bot-data/warns.json","utf-8"))
        }else{
            warns = []
        }
        console.log(configData)
        client.on("messageUpdate",async function(oldMessage,newMessage){
            if (!oldMessage.author.bot){
                var options = {}
                options.messageAuthor = "<@"+oldMessage.author.id+">"
                options.messageContent = oldMessage.content
                sendLog(oldMessage.guild.id,"messageEdit",options)
            }
        })
        client.on("messageDelete",async function(message){
            if (!deleteMessage[message.id]){
                var lastAudit = await message.channel.guild.fetchAuditLogs({"limit":1})
                lastAudit=lastAudit.entries.first()
                var options = {}
                console.log(lastAudit.action,lastAudit.target.id)
                if (lastAudit.action == "MESSAGE_DELETE" && lastAudit.target.id == message.author.id){
                    options.member = "<@"+lastAudit.executor.id+">"
                }else{
                    options.member = "<@"+message.author.id+">"
                }
                options.messageAuthor = "<@"+message.author.id+">"
                options.messageContent = message.content
                sendLog(message.guild.id,"messageDelete",options)
            }
        })
        client.on("channelCreate",async function(channel){
            var lastAudit = await channel.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.channel = "<#"+lastAudit.target.id+">"
            sendLog(channel.guild.id,"channelCreate",options)
        })
        client.on("channelDelete",async function(channel){
            var lastAudit = await channel.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.channelName = channel.name
            sendLog(channel.guild.id,"channelDelete",options)
        })
        client.on("channelUpdate",async function(channel){
            var lastAudit = await channel.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.channel = "<#"+channel.id+">"
            sendLog(channel.guild.id,"channelUpdate",options)
        })
        client.on("roleCreate",async function(role){
            var lastAudit = await role.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.role = "<@&"+role.id+">"
            sendLog(role.guild.id,"roleCreate",options)
        })
        client.on("roleDelete",async function(role){
            var lastAudit = await role.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.roleName = role.name
            sendLog(role.guild.id,"roleDelete",options)
        })
        client.on("roleUpdate",async function(role){
            var lastAudit = await role.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.role = "<@&"+role.id+">"
            sendLog(role.guild.id,"roleUpdate",options)
        })
        client.on("emojiCreate",async function(emoji){
            var lastAudit = await emoji.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.emojiName = emoji.name
            sendLog(emoji.guild.id,"emojiCreate",options)
        })
        client.on("emojiDelete",async function(emoji){
            var lastAudit = await emoji.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            options.emojiName = emoji.name
            sendLog(emoji.guild.id,"emojiDelete",options)
        })
        client.on("emojiUpdate",async function(emoji){
            var lastAudit = await emoji.guild.fetchAuditLogs({"limit":1})
            lastAudit=lastAudit.entries.first()
            var options = {}
            options.member = "<@"+lastAudit.executor.id+">"
            console.log(emoji)
            options.emojiName = emoji.name
            sendLog(emoji.guild.id,"emojiUpdate",options)
        })
        client.on("guildMemberAdd",async function(member){
            var options = {}
            options.member = "<@"+member.id+">"
            sendLog(member.guild.id,"guildMemberAdd",options)
        })
        client.on("guildMemberRemove",async function(member){
            var options = {}
            options.member = "<@"+member.id+">"
            sendLog(member.guild.id,"guildMemberRemove",options)
        })
        client.on("message",async function(message){
            if (configData[message.guild.id] && configData[message.guild.id].bad_words){
                if (badWordFound(configData[message.guild.id].bad_words,message.content)){
                    deleteMessage[message.id] = true
                    var embedToSend = JSON.parse(JSON.stringify(embeds.bad_word_found))
                    embedToSend.description = embedToSend.description.replace("{member}","<@"+message.author.id+">")
                    message.channel.send({embed:embedToSend})
                    message.delete()
                }
            }
            if (message.content.startsWith(prefix+"clear")){
                if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.clear){
                    if (message.member.hasPermission("MANAGE_MESSAGES")){
                        if (message.content.split(" ")[1] && parseInt(message.content.split(" ")[1])){
                            try{
                                await message.channel.bulkDelete(parseInt(message.content.split(" ")[1]))
                                var embedToSend = JSON.parse(JSON.stringify(embeds.bulk_delete.success))
                                embedToSend.description = embedToSend.description.replace("{messageNumber}",message.content.split(" ")[1])
                                message.channel.send({embed:embedToSend})
                            }catch(e){
                                var embedToSend = JSON.parse(JSON.stringify(embeds.bulk_delete.error_bot_no_permission))
                                message.channel.send({embed:embedToSend})
                            }
                        }else{
                            var embedToSend = JSON.parse(JSON.stringify(embeds.bulk_delete.error_no_number))
                            embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.bulk_delete.error_no_permission))
                        message.channel.send({embed:embedToSend})
                    }
                }
            }
            if (message.content.startsWith(prefix+"warns")){
                if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.warn){
                    if (message.member.hasPermission("MANAGE_GUILD")){
                        if (message.mentions.members.first()){
                            var userWarns = warns.filter(twarn=>twarn.user == message.mentions.members.first().id)
                            var warnsToText = ""
                            for (var i in userWarns){
                                warnsToText+=(parseInt(i,10)+1)+". **"+userWarns[i].reason+"** par <@"+userWarns[i].warner+">\n"
                            }
                            var embedToSend = JSON.parse(JSON.stringify(embeds.warns.success))
                            embedToSend.description = warnsToText
                            embedToSend.title = embedToSend.title.replace("{member}",message.mentions.members.first().user.tag)
                            message.channel.send({embed:embedToSend})
                        }else{
                            var embedToSend = JSON.parse(JSON.stringify(embeds.warns.error_no_mention))
                            embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.warns.error_no_permission))
                        message.channel.send({embed:embedToSend})
                    }
                }
            }
            
            if (message.content.startsWith(prefix+"warn ")){
                if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.warn){
                    if (message.member.hasPermission("MANAGE_GUILD")){
                        if (message.mentions.members.first()){
                            var raison = message.content.split(" ")
                            raison.splice(0,2)
                            raison.join(" ")
                            var userTag = message.mentions.users.first().tag
                            if (raison == ""){
                                raison = "Aucune raison donnée"
                            }
                            try{
                                warns.push({"warner":message.author.id,"time":Date.now(),"user":message.mentions.members.first().id,"reason":raison})
                                fs.writeFileSync(dataFolder+"/bot-data/warns.json",JSON.stringify(warns))
                                var embedToSend = JSON.parse(JSON.stringify(embeds.warn.success))
                                embedToSend.description = embedToSend.description.replace("{member}","<@"+message.mentions.members.first().id+">").replace("{reason}",raison)
                                message.channel.send({embed:embedToSend})
                            }catch(e){
                                
                            }
                        }else{
                            var embedToSend = JSON.parse(JSON.stringify(embeds.warn.error_no_mention))
                            embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.warn.error_no_permission))
                        message.channel.send({embed:embedToSend})
                    }
                }
            }
            if (message.content.startsWith(prefix+"del-warn ")){
                if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.warn){
                    if (message.member.hasPermission("MANAGE_GUILD")){
                        if (message.mentions.members.first() && message.content.split(" ")[2] && parseInt(message.content.split(" ")[2],10)){
                            var userWarns = warns.filter(twarn=>twarn.user == message.mentions.members.first().id)
                            if (userWarns[parseInt(message.content.split(" ")[2]-1,10)]){
                                var thisWarn = userWarns[parseInt(message.content.split(" ")[2]-1,10)]
                                try{
                                    warns.splice(warns.findIndex(warn=>warn.time == thisWarn.time),1)
                                    fs.writeFileSync(dataFolder+"/bot-data/warns.json",JSON.stringify(warns))
                                    var embedToSend = JSON.parse(JSON.stringify(embeds.del_warn.success))
                                    embedToSend.description = embedToSend.description.replace("{member}","<@"+message.mentions.members.first().id+">").replace("{number}",parseInt(message.content.split(" ")[2],10))
                                    message.channel.send({embed:embedToSend})
                                }catch(e){
                                    
                                }
                            }else{
                                var embedToSend = JSON.parse(JSON.stringify(embeds.del_warn.error_number_not_found))
                                embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                            }
                            
                        }else{
                            var embedToSend = JSON.parse(JSON.stringify(embeds.warn.error_no_mention))
                            embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.warn.error_no_permission))
                        message.channel.send({embed:embedToSend})
                    }
                }
            }
            if (message.content.startsWith(prefix+"ban")){
                if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.ban){
                    if (message.member.hasPermission("BAN_MEMBERS")){
                        if (message.mentions.members && message.mentions.members.first()){
                            var raison = message.content.split(" ")
                            raison.splice(0,2)
                            raison.join(" ")
                            var userTag = message.mentions.users.first().tag
                            if (raison == ""){
                                raison = "Aucune raison donnée"
                            }
                            try{
                                await message.mentions.members.first().ban(raison)
                                var embedToSend = JSON.parse(JSON.stringify(embeds.ban.success))
                                embedToSend.description = embedToSend.description.replace("{member}",userTag).replace("{reason}",raison)
                                message.channel.send({embed:embedToSend})
                            }catch(e){
                                var embedToSend = JSON.parse(JSON.stringify(embeds.ban.error_bot_no_permission))
                                message.channel.send({embed:embedToSend})
                            }
                        }else{
                            var embedToSend = JSON.parse(JSON.stringify(embeds.ban.error_no_mention))
                            embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.ban.error_no_permission))
                        message.channel.send({embed:embedToSend})
                    }
                }
            }
        if (message.content.startsWith(prefix+"kick")){
            if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.kick){
                if (message.member.hasPermission("KICK_MEMBERS")){
                    if (message.mentions.members && message.mentions.members.first()){
                        var raison = message.content.split(" ")
                        raison.splice(0,2)
                        raison.join(" ")
                        var userTag = message.mentions.users.first().tag
                        if (raison == ""){
                            raison = "Aucune raison donnée"
                        }
                        try{
                            await message.mentions.members.first().kick(raison)
                            var embedToSend = JSON.parse(JSON.stringify(embeds.kick.success))
                            embedToSend.description = embedToSend.description.replace("{member}",userTag).replace("{reason}",raison)
                            message.channel.send({embed:embedToSend})
                        }catch(e){
                            var embedToSend = JSON.parse(JSON.stringify(embeds.kick.error_bot_no_permission))
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.kick.error_no_mention))
                        embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                        message.channel.send({embed:embedToSend})
                    }
                }else{
                    var embedToSend = JSON.parse(JSON.stringify(embeds.kick.error_no_permission))
                    message.channel.send({embed:embedToSend})
                }
            }
        }
        if (message.content.startsWith(prefix+"unmute")){
            if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.mute){
                if (message.member.hasPermission("MANAGE_ROLES")){
                    if (message.mentions.members && message.mentions.members.first()){
                        var memberVise = message.mentions.members.first()
                        var raison = message.content.split(" ")
                        raison.splice(0,2)
                        raison.join(" ")
                        var userTag = memberVise.user.tag
                        var guildRoles = message.guild.roles
                        if (raison == ""){
                            raison = "Aucune raison donnée"
                        }
                        if (!guildRoles.cache.find(role=>role.name.toLowerCase() == "mute")){
                            await guildRoles.create({
                                data:{
                                    "name":"Mute",
                                    "permissions":["SEND_MESSAGES"]
                                }
                            })
                        }
                        var muteRole = guildRoles.cache.find(role=>role.name.toLowerCase() == "mute")
                        await memberVise.fetch()
                        try{
                            if (memberVise.roles.cache.has(muteRole.id)) await memberVise.roles.remove(muteRole.id,raison)
                            var embedToSend = JSON.parse(JSON.stringify(embeds.unmute.success))
                            embedToSend.description = embedToSend.description.replace("{member}",userTag).replace("{reason}",raison)
                            message.channel.send({embed:embedToSend})
                        }catch(e){
                            var embedToSend = JSON.parse(JSON.stringify(embeds.unmute.error_bot_no_permission))
                            message.channel.send({embed:embedToSend})
                        }
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.unmute.error_no_mention))
                        embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                        message.channel.send({embed:embedToSend})
                    }
                }else{
                    var embedToSend = JSON.parse(JSON.stringify(embeds.unmute.error_no_permission))
                        message.channel.send({embed:embedToSend})
                }
            }
        }
        if (message.content.startsWith(prefix+"mute")){
            if (configData[message.guild.id] && configData[message.guild.id].commands && configData[message.guild.id].commands.mute){
                if (message.member.hasPermission("MANAGE_ROLES")){
                    if (message.mentions.members && message.mentions.members.first()){
                        var raison = message.content.split(" ")
                        raison.splice(0,2)
                        raison.join(" ")
                        if (raison == ""){
                            raison = "Aucune raison donnée"
                        }
                        var userTag = message.mentions.users.first().tag
                        var guildRoles = message.guild.roles
                        if (!guildRoles.cache.find(role=>role.name.toLowerCase() == "mute")){
                            await guildRoles.create({
                                data:{
                                    "name":"Mute",
                                    "permissions":["SEND_MESSAGES"]
                                }
                            })
                        }
                        try{
                            await message.mentions.members.first().roles.add(guildRoles.cache.find(role=>role.name.toLowerCase() == "mute").id,raison)
                            var embedToSend = JSON.parse(JSON.stringify(embeds.mute.success))
                            embedToSend.description = embedToSend.description.replace("{member}",userTag).replace("{reason}",raison)
                            message.channel.send({embed:embedToSend})
                        }catch(e){
                            var embedToSend = JSON.parse(JSON.stringify(embeds.mute.error_bot_no_permission))
                            message.channel.send({embed:embedToSend})
                        }
                        
                    }else{
                        var embedToSend = JSON.parse(JSON.stringify(embeds.mute.error_no_mention))
                        embedToSend.description = embedToSend.description.replace("{prefix}",prefix)
                        message.channel.send({embed:embedToSend})
                    }
                }else{
                    var embedToSend = JSON.parse(JSON.stringify(embeds.mute.error_no_permission))
                        message.channel.send({embed:embedToSend})
                }
            }
        }
    })
}
}
