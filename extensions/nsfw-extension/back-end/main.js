var client,dataFolder,electron,ipcRenderer
const loveyou = require("loveyou-api")

module.exports = {
    start(){
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        ipcRenderer = this.ipcRenderer
        prefix = this.prefix
        client.on("message",function(msg){
          if (msg.author.bot) return;
          if (msg.channel.type === 'dm') return;
          
                if(msg.content.startsWith(prefix+"boobs")) {
                  if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
                  loveyou.nsfw("boobs").then(url => {
                    msg.channel.send({
                        "embed": {
                          "title": "BOOBS NSFW",
                          "description": "[Clique ici pour voir l'image.]("+url+")",
                          "footer": {
                            "text": "Image génerée par love-you.xyz"
                          },
                          "image": {
                            "url": url
                          }
                        }
                      })
                })
              }
              if(msg.content.startsWith(prefix+"ass")) {
                if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
                loveyou.nsfw("ass").then(url => {
                  msg.channel.send({
                      "embed": {
                        "title": "ASS NSFW",
                        "description": "[Clique ici pour voir l'image.]("+url+")",
                        "footer": {
                          "text": "Image génerée par love-you.xyz"
                        },
                        "image": {
                          "url": url
                        }
                      }
                    })
              })
            }
            if(msg.content.startsWith(prefix+"blowjob")) {
              if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
              loveyou.nsfw("blowjob").then(url => {
                msg.channel.send({
                    "embed": {
                      "title": "BLOWJOB NSFW",
                      "description": "[Clique ici pour voir l'image.]("+url+")",
                      "footer": {
                        "text": "Image génerée par love-you.xyz"
                      },
                      "image": {
                        "url": url
                      }
                    }
                  })
            })
          }
          if(msg.content.startsWith(prefix+"cowgirl")) {
            if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
            loveyou.nsfw("cowgirl").then(url => {
              msg.channel.send({
                  "embed": {
                    "title": "COWGIRL NSFW",
                    "description": "[Clique ici pour voir l'image.]("+url+")",
                    "footer": {
                      "text": "Image génerée par love-you.xyz"
                    },
                    "image": {
                      "url": url
                    }
                  }
                })
          })
        }
        if(msg.content.startsWith(prefix+"cumshots")) {
          if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
          loveyou.nsfw("cumshots").then(url => {
            msg.channel.send({
                "embed": {
                  "title": "CHUMSHOTS NSFW",
                  "description": "[Clique ici pour voir l'image.]("+url+")",
                  "footer": {
                    "text": "Image génerée par love-you.xyz"
                  },
                  "image": {
                    "url": url
                  }
                }
              })
        })
      }
      if(msg.content.startsWith(prefix+"doggystyle")) {
        if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
        loveyou.nsfw("doggystyle").then(url => {
          msg.channel.send({
              "embed": {
                "title": "DOGGYSTYLE NSFW",
                "description": "[Clique ici pour voir l'image.]("+url+")",
                "footer": {
                  "text": "Image génerée par love-you.xyz"
                },
                "image": {
                  "url": url
                }
              }
            })
      })
    }
    if(msg.content.startsWith(prefix+"hentai")) {
      if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
      loveyou.nsfw("hentai").then(url => {
        msg.channel.send({
            "embed": {
              "title": "HENTAI NSFW",
              "description": "[Clique ici pour voir l'image.]("+url+")",
              "footer": {
                "text": "Image génerée par love-you.xyz"
              },
              "image": {
                "url": url
              }
            }
          })
    })
  }  
  if(msg.content.startsWith(prefix+"missionary")) {
    if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
    loveyou.nsfw("missionary").then(url => {
      msg.channel.send({
          "embed": {
            "title": "MISSIONARY NSFW",
            "description": "[Clique ici pour voir l'image.]("+url+")",
            "footer": {
              "text": "Image génerée par love-you.xyz"
            },
            "image": {
              "url": url
            }
          }
        })
  })
}
if(msg.content.startsWith(prefix+"pussy")) {
  if(!msg.channel.nsfw) return msg.reply("🔞 **Utilise la commande dans un salon NSFW !**");
  loveyou.nsfw("pussy").then(url => {
    msg.channel.send({
        "embed": {
          "title": "PUSSY NSFW",
          "description": "[Clique ici pour voir l'image.]("+url+")",
          "footer": {
            "text": "Image génerée par love-you.xyz"
          },
          "image": {
            "url": url
          }
        }
      })
})
}    
        })
    }
}