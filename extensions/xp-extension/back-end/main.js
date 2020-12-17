var client,dataFolder,electron,ipcRenderer,discord
const Enmap = require("enmap");
const AsciiTable = require('ascii-table')

module.exports = {
    start(){
        client = this.client
        prefix = this.prefix
        dataFolder = this.dataFolder
        Discord = this.discord

  client.on("message",function(msg){
    if (msg.author.bot) return;
    if (msg.channel.type === 'dm') return;

        const exp = new Enmap({name: "points", dataDir: dataFolder+'/bot-data/'});
            exp.ensure(`${msg.guild.id}-${msg.author.id}`, {
                user: msg.author.id,
                guild: msg.guild.id,
                xp: 0,
                next_xp: 100,
                level: 1
            });

        exp.math(`${msg.guild.id}-${msg.author.id}`, "+", 1, "xp");

        let xp = exp.get(`${msg.guild.id}-${msg.author.id}`, "xp");
        let n_xp = exp.get(`${msg.guild.id}-${msg.author.id}`, "next_xp")
        let lvl = exp.get(`${msg.guild.id}-${msg.author.id}`, "level")
 
    if (xp > n_xp) {
        msg.reply(`Tu es maintenant niveau **${lvl +1}**! Je te félicite !`).then(message => message.delete({ timeout: 15000}));
    exp.math(`${msg.guild.id}-${msg.author.id}`, "+", 1, "level");
    exp.math(`${msg.guild.id}-${msg.author.id}`, "+", 100, "next_xp");
};

if(msg.content.startsWith(prefix+"rank")) {

  let rank = new AsciiTable('Rank Card')
  rank
  .setHeading('XP', 'Level')
  .addRow(xp, lvl)

  msg.channel.send(rank.toString(), {code: true});

}

if(msg.content.startsWith(prefix+"leaderboard")) {

  msg.guild.members.fetch()

  const filtered = exp.array().filter( p => p.guild === msg.guild.id);

  let top5;

  if(filtered.length < 12) {
    top5 = filtered.length
  } else {
    top5 = 12
  };

  const sorted = filtered.sort((a, b) => b.xp - a.xp);
  let leaderboard = sorted.splice(0, top5)

  const embed = new Discord.MessageEmbed()
    .setTitle("Classement Top "+leaderboard.length)
    .setColor("#2f3136");

    for (let i = 0; i < leaderboard.length; i++) {
      let user;

      let member = msg.guild.members.cache.get(leaderboard[i].user)
      if(!member) {
        user = "Utilisateur introuvable."
      } else {
        user = member.user.username
      }
      embed.addField(`${i + 1}. ${user}`, "`"+leaderboard[i].xp+" XP` / **(Level "+leaderboard[i].level+")**", true);
      }

      msg.channel.send(embed)
}
        });
    }
}