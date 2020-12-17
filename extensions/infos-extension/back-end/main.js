var client,dataFolder,electron
const fs = require("fs")
const moment = require('moment')
const status = {
    online: ":green_circle: En ligne",
    idle: ":orange_circle: Inactif",
    dnd: ":red_circle: Ne pas déranger",
    offline: ":black_circle: Hors ligne/Invisible"
}
module.exports = {
    start(){
        console.log("b")
        client = this.client
        electron = this.electron
        prefix = this.prefix
        Discord = this.discord
        client.on("message",function(message){
            if (message.author.bot) return;
            if (message.channel.type === 'dm') return;
            if(message.content.startsWith(prefix+"userinfo")) {
                const membre = message.mentions.members.first() || message.member;
                const statEmbed = new Discord.MessageEmbed()
            .setColor('#fff300')
            
            .setTitle(`Informations sur ${membre.user.username}`)
            .addFields(
                    { name: "Pseudo", value: membre.user.tag, inline: true},
                    { name: "Surnom", value: membre.nickname || membre.user.username, inline: true},
                    { name: "ID", value: membre.id, inline: true },
                    { name: "Status", value: `${status[membre.user.presence.status]}`, inline: true},
                    { name: "Compte crée le", value: moment.utc(membre.user.createdAt).format("DD/MM/YYYY à HH:mm"), inline: true  },
                    { name: "Rejoin le", value: moment.utc(membre.joinedAt).format("DD/MM/YYYY à HH:mm"), inline: true  },
                    { name: "Jeu", value: `${membre.user.presence.activities}` || "Aucun jeu", inline: true },
                    { name: "Roles", value: membre.roles.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(' | ') ||  ":x: N'a pas de roles !", inline: false},
                )
            .setFooter(`Demande de ${message.author.username}`, `${message.author.displayAvatarURL({dynamic: true})}`)
            .setThumbnail(`${membre.user.displayAvatarURL({dynamic: true})}`)
            .setTimestamp()

    message.channel.send(statEmbed);

            }
            if(message.content.startsWith(prefix+"serverinfo")) {
                let conn = message.guild.members.cache.filter(({ presence }) => presence.status !== 'offline').size;
                var rolesss = message.guild.roles.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(' | ') ||  ":x: Aucun Roles !"
                if(message.guild.roles.cache.size >= 50){
                    rolesss = "Trop de roles !"
                }
                var emojisss = message.guild.emojis.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(' | ') ||  ":x: Aucun Emoji !"
                if(message.guild.emojis.cache.size >= 50){
                    rolesss = "Trop d'emojis' !"
                }
                const statsEmbed = new Discord.MessageEmbed()

            .setColor('#fff300')
            
            .setTitle(`**${message.guild.name}**`)
            .addFields(
                    { name: "Propriétaire", value: `<@${message.guild.owner.user.id}> (\`${message.guild.owner.user.id}\`)`, inline: true},
                    { name: "Membres", value: message.guild.members.cache.size , inline: true},
                    { name: "Membres en ligne", value: conn , inline: true},
                    { name: "Nombre de boost(s)", value: message.guild.premiumSubscriptionCount, inline: true},
                    { name: "Salons", value: message.guild.channels.cache.size, inline: true},
                    { name: "Rôles", value: message.guild.roles.cache.size , inline: true},
                    { name: "Région", value: message.guild.region, inline: true},
                    { name: "Création du serveur:", value: moment.utc(message.guild.createdAt).format("DD/MM/YYYY à HH:mm"), inline: true},
                    { name: `Emoji(s) [${message.guild.emojis.cache.size}]`, value: emojisss, inline: true},
                    { name: `Roles [${message.guild.roles.cache.size}]`, value: rolesss, inline: false},
                    
            )
            .setFooter(`Demande de ${message.author.username}`, `${message.author.displayAvatarURL({dynamic: true})}`)
            .setTimestamp()
            .setThumbnail(`${message.guild.iconURL({dynamic: true})}`)
    message.channel.send(statsEmbed);

            }
        })
    }
}