var client,dataFolder,Canvas,ipc,Discord,serverPrefix,binchannel,dataFolder,ticketsFile
const fs = require("fs")

module.exports = {
    start(){
      
        client = this.client
        ipc = this.electron.ipcMain
        Discord = this.discord
        prefix = this.prefix
        dataFolder = this.dataFolder
        if (!fs.existsSync(dataFolder+"/bot-data/tickets.json")){
          fs.writeFileSync(dataFolder+"/bot-data/tickets.json","{}")
        }
        ticketsFile = JSON.parse(fs.readFileSync(dataFolder+"/bot-data/tickets.json","utf8"))
        client.on("message",async function(message){
          if (!message.guild) return
            if (message.content.startsWith(prefix+"setticket")){
              if (message.content.split(" ")[1]){
                if (message.guild.channels.cache.has(message.content.split(" ")[1])){
                  ticketsFile[message.guild.id] = {"tickets":[],"category":message.content.split(" ")[1]}
                  fs.writeFileSync(dataFolder+"/bot-data/tickets.json",JSON.stringify(ticketsFile))
                  message.channel.send("Les paramètres des tickets ont bien été ajoutés. Vous pouvez dès maintenant vous servir du système de ticket avec "+prefix+"ticket <raison>")
                }else{
                  message.channel.send("Vous devez fournir un identifiant de catégorie valide")
                }
              }else{
                message.channel.send("Vous devez fournir un identifiant de catégorie valide")
              }
            }
          if (message.content.startsWith(prefix+"ticket create")){
            var raison = "Aucune raison donnée"
            if (message.content.split(" ")[2]){
              raison = message.content.split(" ")[2]
            }
            if (ticketsFile[message.guild.id]){
              if (!ticketsFile[message.guild.id].tickets.find(t=>t.creator == message.author.id)){
                if (message.guild.channels.cache.has(ticketsFile[message.guild.id].category)){
                  var thisChannel = await message.guild.channels.create(raison,{parent:ticketsFile[message.guild.id].category})
                  await thisChannel.updateOverwrite(message.author,{"VIEW_CHANNEL":true,"SEND_MESSAGES":true})
                  ticketsFile[message.guild.id].tickets.push({"creator":message.author.id,"channel":thisChannel.id})
                  fs.writeFileSync(dataFolder+"/bot-data/tickets.json",JSON.stringify(ticketsFile))
                  message.channel.send("Ticket créé: <#"+thisChannel+">")
                  thisChannel.send("**Ticket créé par** <@"+message.author.id+">\nRaison donnée: "+raison)
                }else{
                  message.channel.send("Impossible de créer un ticket, demandez à un administrateur de refaire un "+prefix+"setticket!")
                }
              }else{
                if (!message.guild.channels.cache.has(ticketsFile[message.guild.id].tickets.find(t=>t.creator == message.author.id).channel)){
                  ticketsFile[message.guild.id].tickets.splice(ticketsFile[message.guild.id].tickets.findIndex(t=>t.creator == message.author.id),1)
                  fs.writeFileSync(dataFolder+"/bot-data/tickets.json",JSON.stringify(ticketsFile))
                  message.channel.send("Il semble que votre ancien salon de ticket n'existe plus... Je viens de l'effacer. Vous devriez refaire cette commande")
                }else{
                  message.channel.send("Vous avez déjà un ticket d'ouvert")
                }
              }
            }else{
              message.channel.send("Aucun système de ticket créé. Faites la commandes "+prefix+"setticket <id de catégorie> pour commencer")
            }
          }
          if (message.content.toLowerCase() == prefix+"ticket close"){
            if (ticketsFile[message.guild.id]){
              if (ticketsFile[message.guild.id].tickets.find(t=>t.channel == message.channel)){
                await message.channel.delete()
                ticketsFile[message.guild.id].tickets.splice(ticketsFile[message.guild.id].tickets.findIndex(t=>t.channel == message.channel),1)
                fs.writeFileSync(dataFolder+"/bot-data/tickets.json",JSON.stringify(ticketsFile))
                message.channel.send("Ticket fermé avec succès")
              }else{
                 message.channel.send("Aucun ticket ouvert dans ce salon")
              }
            }else{
              message.channel.send("Aucun système de ticket créé. Faites la commandes "+prefix+"setticket <id de catégorie> pour commencer")
            }
          }
        })
    }
}