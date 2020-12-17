var client,dataFolder,Canvas,ipc,Discord,serverPrefix,binchannel,dataFolder
const fs = require("fs")

var robotoAlreadyAdd = false
var unoCards
var unoGames = []
var prefixFile = {}
// https://expressjs.com/en/starter/basic-routing.html
 
var unoCardColor = {"blue":5527039,"red":16733525,"yellow":16755201,"green":43521}
var unoToFrench={"blue":"bleu","red":"rouge","yellow":"jaune","green":"vert","0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","skip":"passe ton tour","reverse":"inversion de sens","draw2":"+2","wild":"changement de couleur","wildDraw4":"+4","black":"noir"}
    


function safeSaveData(file,data){
    try{
      //fs.writeFileSync(file, data)
      console.log("saveData")
    }catch(e){
      
    } 
  }
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  
  function getNewUnoGameId(){
        var Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var CurrentId = ""
        while (CurrentId==""||unoGames.find(element => element.code==CurrentId)){
          CurrentId = ""
          for (let a = 0; a <= 5; a++) {
            CurrentId = CurrentId + Characters[Math.floor(Math.random() * Characters.length)];
          }
        }
  
        return CurrentId
      }
  
   async function getCardsImage(id,data){
        var userCards = data.playingPlayers.find(element=>element.id==id).cards
        const canvas = new Canvas(240*userCards.length, 450);
              for (var a=0;a<userCards.length;a++){
                await canvas.addImage(userCards[a].url,a*240,0,240,360)
                canvas.executeOnContext(`font = '50px Roboto'`);
                canvas.executeOnContext(`fillStyle = '#ffffff'`);
                canvas.executeOnContext(`fillText(`+(parseInt(a)+1)+`, `+(parseInt(a)*240+90)+`,400)`);
              }
              var attachment = new Discord.MessageAttachment(await canvas.toBuffer());
         var messageSent = await client.channels.cache.get(binchannel).send(attachment)
          return messageSent.attachments.first().url
      }
  
  async function getEveryPlayerImageUno(playingPlayers){
    const canvas = new Canvas(100*playingPlayers.length, 120);
    if (!robotoAlreadyAdd){
        robotoAlreadyAdd = true
        await canvas.addFont("Roboto","https://cdn.discordapp.com/attachments/732928106435706900/787378436317511720/Roboto-Bold.ttf")
    }
        for (var i in playingPlayers){ 
            await canvas.addImage(client.users.cache.get(playingPlayers[i].id).displayAvatarURL({ format: 'png' }),i*90,0,80,80)
            await canvas.addImage("https://cdn.discordapp.com/attachments/690204030831820833/718860969845194913/iu-removebg-preview.png",i*90+35,85,30,30)
            canvas.executeOnContext(`font = '15px Roboto '`);
            canvas.executeOnContext(`fillStyle = '#ffffff '`)
            canvas.executeOnContext(`fillText(`+playingPlayers[i].cards.length+`, `+(parseInt(i)*90+20)+`,107)`);
        }
        var attachment = new Discord.MessageAttachment(await canvas.toBuffer());
        var messageSent = await client.channels.cache.get(binchannel).send(attachment)
        return messageSent.attachments.first().url
      }
  async function getFinalImageUno(data){
    var backgrounds = ["https://cdn.discordapp.com/attachments/721766122906714114/722130299055636560/Ooj8fsfFC82X8EV67kAAAAASUVORK5CYII.png","https://cdn.discordapp.com/attachments/721766122906714114/722130448226058343/ptfvXRP0H6529N7YQoKAAAAAASUVORK5CYII.png","https://cdn.discordapp.com/attachments/721766122906714114/722361719086907432/H7H0RX5bC2wedLAAAAAElFTkSuQmCC.png"]
    const canvas = new Canvas(800, 200*data.playingPlayers.length);
        data.playingPlayers.sort(function(a, b){return a.cards.length-b.cards.length});
      var cardImage = "https://cdn.discordapp.com/attachments/690204030831820833/718860969845194913/iu-removebg-preview.png"
          
        for (var i in data.playingPlayers){  
          if (backgrounds[i]){
            await canvas.addImage(backgrounds[i], 0,200*i,800,200);
          }
          await canvas.addImage(client.users.cache.get(data.playingPlayers[i].id).displayAvatarURL({ format: 'png' }),50,25+i*200,120,120)
          canvas.executeOnContext(`font = '15px Roboto '`);
          canvas.executeOnContext(`fillStyle = '#ffffff'`);
          canvas.executeOnContext(`textAlign="center"`)
          canvas.executeOnContext(`fillText(`+client.users.cache.get(data.playingPlayers[i].id).tag+`, 110,`+(165+200*parseInt(i)+`)`));
          await canvas.addImage(cardImage, 260,65+200*i,50,50);
          canvas.executeOnContext(`font = '25px Roboto '`);
          canvas.executeOnContext(`fillStyle = '#ffffff'`);
          canvas.executeOnContext(`textAlign="center"`)
          canvas.executeOnContext(`fillText(`+data.playingPlayers[i].cards.length+`, 250,`+(100+200*parseInt(i))+`)`);
          canvas.executeOnContext(`font = '50px Roboto '`);
          canvas.executeOnContext(`fillStyle = '#ffffff'`);
          canvas.executeOnContext(`textAlign="center"`)
          canvas.executeOnContext(`fillText(`+data.playingPlayers[i].title.name+`, 550,`+(60+200*parseInt(i))+`)`);
          canvas.executeOnContext(`font = '20px Roboto '`);
          canvas.executeOnContext(`fillStyle = '#ffffff'`);
          canvas.executeOnContext(`textAlign="center"`)
          canvas.executeOnContext(`fillText(`+data.playingPlayers[i].title.description.replace("<value>",data.playingPlayers[i].title.statData)+`, 550,`+130+200*i+`)`);
        }
        var attachment = new Discord.MessageAttachment(await canvas.toBuffer());
         var messageSent = await client.channels.cache.get(binchannel).send(attachment)
          return messageSent.attachments.first().url
      }

      async function nextTurnUno(data,playGameBack){
        console.log("nextTurn2")
        unoGames[unoGames.findIndex(element=>element.code == data.code)] = data
        safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
        console.log(data)
        var mainChannel 
        var category 
        var cards = JSON.parse(JSON.stringify(unoCards))
        var nextTurnAction= data.nextTurnAction
        if (client.channels.cache.has(data.mainChannel)){
          mainChannel = client.channels.cache.get(data.mainChannel)
        }else{
          console.log("delete main")
          unoGames.splice(unoGames.findIndex(element=>element.code==data.code),1)
          safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
          return
        }
        if (client.channels.cache.has(data.category)){
          category = client.channels.cache.get(data.category)
        }else{
          console.log("delete category")
          unoGames.splice(unoGames.findIndex(element=>element.code==data.code),1)
          safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
          return
        }
                  if (data.playingPlayers.find(element=>element.id==data.playerTurn) && data.playingPlayers.find(element=>element.id==data.playerTurn).cards==0){
                    var titles = [{"dataToTake":"draw4Played","name":"Chanceux","description":"A joué <value> +4","coefficient":1},{"dataToTake":"cardsPiocheDraw","name":"La cible","description":"A pioché <value> cartes à cause d'autre joueurs","coefficient":1},{"dataToTake":"reverseUse","name":"Meneur de jeu","description":"A changé <value> fois le sens du jeu","coefficient":1},{"dataToTake":"skipGot","name":"Fantôme","description":"N'a pas pu jouer <value> fois à cause des cartes passe ton tour","coefficient":1},{"dataToTake":"skipUse","name":"Briseur de rêves","description":"A passé le tour d'un autre joueur <value> fois","coefficient":1}]
                    console.log(data.playingPlayers)
                    var tempPlayingPlayersTable = shuffle(JSON.parse(JSON.stringify(data.playingPlayers)))
                    for (var i in titles){
                      tempPlayingPlayersTable.sort(function(a,b){return b.stats[titles.dataToTake]-a.stats[titles.dataToTake]})
                      console.log(tempPlayingPlayersTable)
                      if (tempPlayingPlayersTable[0] && data.playingPlayers.find(element=>element.id==tempPlayingPlayersTable[0].id).stats[titles[i].dataToTake] != undefined){
                        data.playingPlayers.find(element=>element.id==tempPlayingPlayersTable[0].id).title = titles[i]
                        data.playingPlayers.find(element=>element.id==tempPlayingPlayersTable[0].id).title.statData = data.playingPlayers.find(element=>element.id==tempPlayingPlayersTable[0].id).stats[titles[i].dataToTake]
                        tempPlayingPlayersTable.splice(0,1)
                      }
                    }
                    var playersWithNoTitles = data.playingPlayers.filter(element=>!element.title)
                    for (var i in playersWithNoTitles){
                       data.playingPlayers.find(player=>player.id==playersWithNoTitles[i].id).title = {"dataToTake":"","name":"Aucun titre","description":"Aucun titre","coefficient":1,statData:0}
                    }
                    await mainChannel.send({embed:{
                          "title":"C'est terminé!",
                          "description": "<@"+data.playerTurn+"> vient de gagner la partie!",
                  "image":{"url":await getFinalImageUno(data)}
                  }})
                     if (client.channels.cache.has(data.unoMessageChannel)){
                      var fetchMessage = await client.channels.cache.get(data.unoMessageChannel).messages.fetch(data.unoMessage)
                      if (fetchMessage){
                        var embedDescription = "<@"+data.playerTurn+"> a gagné la partie.\n\nJoueurs: "
                        for (var i in data.playingPlayers){
                          embedDescription+="<@"+data.playingPlayers[i].id+"> "
                        }
                        fetchMessage.edit({embed:{
                          "title":"Partie de uno terminée",
                          "description":embedDescription,
                          "image":{"url":await getFinalImageUno(data)},
                        }})
                      }
                    }
                function delay(ms) { 
            return new Promise(resolve => setTimeout(resolve, ms));
          }
                await delay(30000)
                await mainChannel.delete()
                for (var i in data.playingPlayers){
                  await client.channels.cache.get(data.playingPlayers[i].channel).delete()
                }
                await category.delete()
                unoGames.splice(unoGames.findIndex(element=>element.code==data.code),1)
                safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
                    return
                  }
        console.log(data.nextPlayer)
                  if (data.nextPlayer && !playGameBack){
                    data.playerTurn=data.nextPlayer.id
                  }
                  
                  if (data.turn){ 
                    var nextPlayerIndex = parseInt(data.playingPlayers.findIndex(element=>element.id==data.playerTurn))+1
                    console.log(nextPlayerIndex)
                    if (nextPlayerIndex >= data.playingPlayers.length){
                      nextPlayerIndex=0
                    } 
                    data.nextPlayer = data.playingPlayers[nextPlayerIndex]
                  }else{
                    var nextPlayerIndex = parseInt(data.playingPlayers.findIndex(element=>element.id==data.playerTurn))-1
                    if (nextPlayerIndex <0){
                      nextPlayerIndex=data.playingPlayers.length-1 
                    }
                    data.nextPlayer = data.playingPlayers[nextPlayerIndex]
                  } 
        console.log(data.nextPlayer && !playGameBack)
        
                  if (data.nextTurnAction && data.nextTurnAction.type == "draw"){
                    if (data.options.cardStack==false || (data.nextTurnAction.lastCard=="draw2" && !data.playingPlayers.find(element=>element.id==data.playerTurn).cards.find(element=>element.number=="draw2" || (data.server == "688048526537785344" && element.number=="wildDraw4"))) ||  (data.nextTurnAction.lastCard=="wildDraw4" && !data.playingPlayers.find(element=>element.id==data.playerTurn).cards.find(element=> element.number=="wildDraw4"))){
                    var descPioche = ""
                    for (var i=0;i<data.nextTurnAction.number;i++){
                      var cardIndex = Math.floor(Math.random()*cards.length)
                      data.playingPlayers.find(element=>element.id==data.playerTurn).cards.push(cards[cardIndex])
                      cards.splice(cardIndex,1)
                      var cartePiochee = data.playingPlayers.find(element=>element.id==data.playerTurn).cards[data.playingPlayers.find(element=>element.id==data.playerTurn).cards.length-1]
                      descPioche+=unoToFrench[cartePiochee.number]+" "+unoToFrench[cartePiochee.color]+"\n"
                    }
                      if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsPiocheDraw){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsPiocheDraw = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsPiocheDraw+=data.nextTurnAction.number
                    var turnMessage = await mainChannel.send({embed:{
                    "title":"Uno",
                    "description": "<@"+data.playerTurn+"> a pioché "+data.nextTurnAction.number+" cartes",
                          "thumbnail":{"url":data.currentCard.url}
                  }})
                    client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                    "title":"Uno",
                    "description": "Vous venez de piocher les cartes suivantes:\n\n"+descPioche,
                  }})
                    data.nextTurnAction = {}
                    nextTurnUno(data)
                    return
                  }
                  }
                  if (data.nextTurnAction && data.nextTurnAction.type == "skip"){
                    var turnMessage = await mainChannel.send({embed:{
                    "title":"Uno",
                    "description": "<@"+data.playerTurn+"> n'a pas pu jouer ce tour-ci",
                          "thumbnail":{"url":data.currentCard.url}
                  }})
                     if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipGot){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipGot = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipGot++
                     data.nextTurnAction = {}
                    nextTurnUno(data)
                    return
                  }
                  if (data.nextTurnAction && data.nextTurnAction.type == "draw"){
                    var turnMessage = await mainChannel.send({embed:{
                    "title":"Uno",
                    "description": "<@"+data.playerTurn+"> peut additionner une autre carte\n<@"+data.nextPlayer.id+"> est le prochain joueur à jouer\n\nIl y a pour le moment **"+data.nextTurnAction.number+" cartes** dans l'addition!",
                          "thumbnail":{"url":data.currentCard.url},
                    "image":{"url":await getEveryPlayerImageUno(data.playingPlayers)},
                    "color":unoCardColor[data.currentCard.color]
                  }})
                  client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                    "title":"Uno",
                    "description": "C'est à vous de jouer! Vous êtes visé par la carte "+unoToFrench[data.currentCard.number]+ " "+unoToFrench[data.currentCard.color],
                    image:{"url":await getCardsImage(data.playerTurn,data)},
                    thumbnail:{"url":data.currentCard.url}
                  }})
                  }else{
                  var turnMessage = await mainChannel.send({embed:{
                    "title":"Uno",
                    "description": "C'est au tour de <@"+data.playerTurn+">\n<@"+data.nextPlayer.id+"> est le prochain joueur à jouer",
                          "thumbnail":{"url":data.currentCard.url},
                    "image":{"url":await getEveryPlayerImageUno(data.playingPlayers)},
                    "color":unoCardColor[data.currentCard.color]
                  }})
                  await client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                    "title":"Uno",
                    "description": "C'est à vous de jouer! Envoyez dans votre prochain message le nombre correspondant à la carte que vous voulez jouer!",
                    image:{"url":await getCardsImage(data.playerTurn,data)},
                    thumbnail:{"url":data.currentCard.url}
                  }})
                    if (client.channels.cache.has(data.unoMessageChannel)){
                      var fetchMessage = await client.channels.cache.get(data.unoMessageChannel).messages.fetch(data.unoMessage)
                      if (fetchMessage){
                        var embedDescription = "Appuyez sur 👀 pour regarder la partie.\n\nJoueurs: "
                        for (var i in data.playingPlayers){
                          embedDescription+="<@"+data.playingPlayers[i].id+"> "
                        }
                        fetchMessage.edit({embed:{
                          "title":"Partie de uno en cours",
                          "description":embedDescription,
                          "image":{"url":await getEveryPlayerImageUno(data.playingPlayers)},
                        }})
                      }
                    }
                  }
                  var unoCollector
                  if (data.playingPlayers.find(player=>player.cards.length==1 && !player.uno && data.playerTurn != player.id)){
                    console.log("one card left")
                    unoCollector = client.channels.cache.get(data.mainChannel).createMessageCollector(element=>element);
                  unoCollector.on("collect",async function(collectMessage){
                    if (collectMessage.content == "contre-uno" || collectMessage.content == "contre uno"){
                      if (data.playingPlayers.find(player=>player.cards.length==1 && !player.uno && data.playerTurn != player.id)){
                        var descPioche = ""
                        var playerNoUno = data.playingPlayers.find(player=>player.cards.length==1 && !player.uno && data.playerTurn != player.id)
                    for (var i=0;i<2;i++){
                      var cardIndex = Math.floor(Math.random()*cards.length)
                      playerNoUno.cards.push(cards[cardIndex])
                      
                      var cartePiochee = cards[cardIndex]
                      cards.splice(cardIndex,1)
                      descPioche+=unoToFrench[cartePiochee.number]+" "+unoToFrench[cartePiochee.color]+"\n"
                    }
      client.channels.cache.get(playerNoUno.channel).send({embed:{
                    "title":"Uno",
                    "description": "Vous venez de piocher les cartes suivantes:\n\n"+descPioche,
                  }})
                        unoCollector.channel.send({embed:{
                    "title":"Contre-uno!",
                    "description": "<@"+playerNoUno.id+"> n'a pas dit uno! Il a donc pioché 2 cartes!"
                      }})
                        
                      }
                    }
                  })
                  }
                  var playerTurnData = data.playingPlayers.find(element=>element.id==data.playerTurn)
                  if (playerTurnData.uno){
                    delete playerTurnData.uno
                  }
                  const collector = client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).createMessageCollector(element=>element);
                  collector.on("stop",function(){
                    if (unoCollector){
                      unoCollector.stop()
                    }
                  })          
        collector.on("collect",async function(collectMessage){
                    if (parseInt(collectMessage.content) && playerTurnData.cards[parseInt(collectMessage.content)-1]){
                      var cardChoosen = playerTurnData.cards[parseInt(collectMessage.content)-1]
                      if (data.currentCard.color == cardChoosen.color || data.currentCard.number == cardChoosen.number || cardChoosen.color=="black"){
                        if (playerTurnData.cards.length == 1 && cardChoosen.color=="black"){
                          await collector.channel.send("Vous ne pouvez pas jouer une carte noire en dernier")
                          return 
                        }
                        data.currentCard = cardChoosen 
                        playerTurnData.cards.splice(parseInt(collectMessage.content)-1,1)
                        if (data.currentCard.color=="black"){
                          var urlAllCards = "https://cdn.discordapp.com/attachments/760531828473069568/768520355211640832/allwildcards.png"
                          if (data.currentCard.number=="wildDraw4"){
                            urlAllCards="https://cdn.discordapp.com/attachments/760531828473069568/768519900033449984/all4Cards.png"
                          }
                          if (data.currentCard.number!="wildDraw4" && data.nextTurnAction && data.nextTurnAction.type == "draw"){
                            await client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send("Cette carte ne peut pas être jouée pour le moment. Vous pouvez additionner une carte avec la carte en jeu ou piocher en disant draw.")
                            return
                          }
                          await collector.channel.send({embed:{
                          "title":"Uno",
                          "description": "Vous venez de jouer une carte **noire**. Choisissez la prochaine couleur",
                          "image":{"url":urlAllCards}
                        }})
                          collector.stop()
                          const filter = (FilterMessage) => parseInt(FilterMessage.content) && parseInt(FilterMessage.content)>0 && parseInt(FilterMessage.content)<5
                          var MessageReceived = await collector.channel.awaitMessages(filter, { max:1 })
                          MessageReceived = MessageReceived.first()
                          if (parseInt(MessageReceived.content) == "1"){
                            if (data.currentCard.number == "wildDraw4"){
                              data.currentCard = {"color":"blue","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718845578053681172/4bleu.png"}
                            }else{
                              data.currentCard = {"color":"blue","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718866927384264774/wildbleu.png"}
                            }
                          }
                          if (parseInt(MessageReceived.content) == "2"){
                            if (data.currentCard.number == "wildDraw4"){
                              data.currentCard = {"color":"red","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718845616289218690/4rouge.png"}
                            }else{
                              data.currentCard = {"color":"red","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718866969960513577/wildrouge.png"}
                           
                            }
                          }
                          if (parseInt(MessageReceived.content) == "3"){
                            if (data.currentCard.number == "wildDraw4"){
                              data.currentCard = {"color":"green","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718845633284538398/4vert.png"}
                            }else{
                               data.currentCard = {"color":"green","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718866992676995180/wildvert.png"}
                          
                            }
                          }
                          console.log(MessageReceived.content,data.currentCard)
                          if (parseInt(MessageReceived.content) == "4"){
                            if (data.currentCard.number == "wildDraw4"){
                              data.currentCard = {"color":"yellow","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718845598954029197/4jaune.png"}
                            }else{
                                 data.currentCard = {"color":"yellow","number":data.currentCard.number,"url":"https://cdn.discordapp.com/attachments/690204030831820833/718866947952869456/wildjaune.png"}
                           
                            }
                          }
                          if (data.currentCard.number == "wildDraw4"){
                            if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.draw4Played){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.draw4Played = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.draw4Played++
                            if (data.nextTurnAction && data.nextTurnAction.type == "draw"){
                            data.nextTurnAction.number+=4
                            data.nextTurnAction.lastCard = data.currentCard.number
                          }else{
                            
                            data.nextTurnAction = {"type":"draw","number":4,"lastCard":"wildDraw4"}
                          }
                          }
                        }
                        
                        if ((data.currentCard.number!="draw2" && data.currentCard.number!="wildDraw4") && data.nextTurnAction && data.nextTurnAction.type == "draw"){
                          
                            await client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send("Cette carte ne peut pas être jouée pour le moment. Vous pouvez additionner une carte avec la carte en jeu ou piocher en disant draw.")
                            return
                          }
                        await mainChannel.send({embed:{
                          "title":"Uno",
                          "description": "<@"+data.playerTurn+"> vient de jouer la carte **"+unoToFrench[data.currentCard.number]+" "+unoToFrench[data.currentCard.color]+"**",
                          "thumbnail":{"url":data.currentCard.url}
                        }})
                        await client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                          "title":"Uno",
                          "description": "Vous venez de jouer cette carte",
                          "thumbnail":{"url":data.currentCard.url}
                        }})
                        if (data.currentCard.number=="reverse"){ 
                          if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.reverseUse){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.reverseUse = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.reverseUse++
                          if (data.playingPlayers.length == 2){
                            data.nextTurnAction = {"type":"skip"}
                          }else{
                          if (data.turn == true){
                            data.turn=false
                          }else{
                            data.turn = true
                          }
                          if (data.turn){
                    var nextPlayerIndex = parseInt(data.playingPlayers.findIndex(element=>element.id==data.playerTurn))+1
                    console.log(nextPlayerIndex)
                    if (nextPlayerIndex >= data.playingPlayers.length){
                      nextPlayerIndex=0
                    }
                    data.nextPlayer = data.playingPlayers[nextPlayerIndex]
                  }else{
                    var nextPlayerIndex = parseInt(data.playingPlayers.findIndex(element=>element.id==data.playerTurn))-1
                    if (nextPlayerIndex <0){
                      nextPlayerIndex=data.playingPlayers.length-1
                    }
                    data.nextPlayer = data.playingPlayers[nextPlayerIndex]
                  }
                          await mainChannel.send({embed:{
                          "title":"Changement de sens!",
                          "description": "Le sens du jeu vient de changer!",
                          "thumbnail":{"url":data.currentCard.url}
                        }})
                          }
                        }
                        if (data.currentCard.number=="skip"){
                          data.nextTurnAction = {"type":"skip"}
                           if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipUse){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipUse = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.skipUse++
                        }
                        if (data.currentCard.number=="draw2"){
                          if (data.nextTurnAction && data.nextTurnAction.type == "draw"){
                            data.nextTurnAction.number+=2
                            data.nextTurnAction.lastCard = data.currentCard.number
                          }else{
                            data.nextTurnAction = {"type":"draw","number":2,"lastCard":"draw2"}
                          }
                        }
                        collector.stop()
                        nextTurnUno(data)
                      }else{
                        collector.channel.send("Cette carte ne peut pas être utilisée, sélectionnez en une autre ou piochez en disant **draw**")
                      }
                    }else{
                      if (collectMessage.content=="draw"){
                        if (data.nextTurnAction && data.nextTurnAction.type == "draw"){
                          var desc = ""
                          for (var i =0;i<data.nextTurnAction.number;i++){
                            var cardIndex = Math.floor(Math.random()*cards.length)
                        data.playingPlayers.find(element=>element.id==data.playerTurn).cards.push(cards[cardIndex])
                        cards.splice(cardIndex,1)
                        var cartePiochee = data.playingPlayers.find(element=>element.id==data.playerTurn).cards[data.playingPlayers.find(element=>element.id==data.playerTurn).cards.length-1]
                        desc+=unoToFrench[cartePiochee.number]+" "+unoToFrench[cartePiochee.color]+"\n"
                          }
                          var turnMessage = await mainChannel.send({embed:{
                    "title":"Uno",
                    "description": "<@"+data.playerTurn+"> a pioché "+data.nextTurnAction.number+" cartes",
                          "thumbnail":{"url":data.currentCard.url}
                  }})
                    client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                    "title":"Uno",
                    "description": "Vous venez de piocher les cartes suivantes:\n\n"+desc,
                  }})
                    data.nextTurnAction = {}
                        }else{
                        var cardIndex = Math.floor(Math.random()*cards.length)
                        data.playingPlayers.find(element=>element.id==data.playerTurn).cards.push(cards[cardIndex])
                        cards.splice(cardIndex,1)
                        var cartePiochee = data.playingPlayers.find(element=>element.id==data.playerTurn).cards[data.playingPlayers.find(element=>element.id==data.playerTurn).cards.length-1]
                        await client.channels.cache.get(data.playingPlayers.find(element=>element.id==data.playerTurn).channel).send({embed:{
                          "title":"Uno",
                          "description": "Vous venez de piocher cette carte",
                          "thumbnail":{"url":cartePiochee.url}
                        }})
                        await mainChannel.send({embed:{
                          "title":"Uno",
                          "description": "<@"+data.playerTurn+"> vient de piocher une carte",
                          "color":unoCardColor[data.currentCard.color]
                        }})
                          if (!data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsDraw){
                            data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsDraw = 0
                          }
                          data.playingPlayers.find(element=>element.id==data.playerTurn).stats.cardsDraw++
                        }
                        collector.stop()
                        nextTurnUno(data)
                      }else{
                        
                      }
                    }
                  }) 
                }
      
      async function startGameUno(unoMessage,players,options,creatorId){
        var playingPlayers = []
        var cards = JSON.parse(JSON.stringify(unoCards))
                var category = await unoMessage.guild.channels.create("UNO",{"type":"category"})
                var permissions = []
                for (var i in players){
                 permissions.push( {"id":players[i],"allow":["VIEW_CHANNEL"]})
                }
                permissions.push({"id":unoMessage.guild.id,"deny":["VIEW_CHANNEL"]})
                console.log(permissions)
                var mainChannel = await unoMessage.guild.channels.create("salon-uno",{"type":"text",parent:category,permissionOverwrites:permissions})
                mainChannel.send("Ceci est le salon principal de votre partie de uno! C'est ici que vous allez pouvoir parler et voir le déroulement de votre partie.\n\nVotre partie commence dans quelques secondes\n\nComment jouer:\nLorsque c'est votre tour, envoyez le nombre en dessous votre carte pour la jouer.\nSi vous ne pouvez pas jouer, envoyez `draw`\nLorsque vous avez plus qu'une carte, envoyez uno pour dire uno\nSi une autre personne n'a plus qu'une carte et n'a pas dit uno, vous pouvez dire contre-uno pour lui faire piocher 2 cartes\n\nBon jeu!")
                for (var i in players){
                  playingPlayers.push({"id":players[i],cards:[],"stats":{}})
                  for (var a=0;a<7;a++ ){
                    var cardIndex = Math.floor(Math.random()*cards.length)
                    //var cardIndex = cards.findIndex(element=>element.number=="draw2" || element.number=="wildDraw4")
                    playingPlayers.find(element=>element.id==players[i]).cards.push(cards[cardIndex])
                    cards.splice(cardIndex,1)
                  }
                  var playerChannel = await unoMessage.guild.channels.create("uno-"+client.users.cache.get(players[i]).tag,{"type":"text",parent:category,permissionOverwrites:[{"id":players[i],"allow":["VIEW_CHANNEL"]},{"id":unoMessage.guild.id,"deny":["VIEW_CHANNEL"]}]})
                  playingPlayers.find(element=>element.id==players[i]).channel = playerChannel.id
                  await playerChannel.send("Ceci est votre salon personnel. C'est ici que vous allez pouvoir voir vos cartes et les jouer lorsque c'est votre tour")
                }
                await unoMessage.reactions.removeAll()
                unoMessage.edit({"embed":{
                 title: "Partie de uno en cours",
                 description:"Une partie de Uno a commencé. Vous avez envie de la regarder? Alors cliquez sur 👀",
               }})
                console.log(playingPlayers)
                for (var i in playingPlayers){
                  console.log(i)
                  const canvas = new Canvas(240*playingPlayers[i].cards.length, 360);
                  //console.log(playingPlayers[i].cards)
                  for (var a=0;a<playingPlayers[i].cards.length;a++){
                    await canvas.addImage(playingPlayers[i].cards[a].url, a*240,0,240,360);
                  }
                  console.log(playingPlayers[i])
                  var attachment = new Discord.MessageAttachment(await canvas.toBuffer());
                  client.channels.cache.get(playingPlayers[i].channel).send("Voici vos cartes! Gardez les secrètes",attachment)
                }
                await unoMessage.react("👀") 
                var Collector =unoMessage.createReactionCollector((reaction,user)=>user.bot==false);
                 Collector.on('collect', async(reaction,user) => {
                 	if (reaction.emoji.toString()=="👀" ){
                 		mainChannel.updateOverwrite(user.id,{"VIEW_CHANNEL":true})
                 	}
                 })
                var playerTurn = playingPlayers[0].id
                var cardIndex = Math.floor(Math.random()*cards.filter(element=>element.color!="black").length)
                var currentCard = cards.filter(element=>element.color!="black")[cardIndex]
                cards.splice(cardIndex,1)
                var data = {playingPlayers:playingPlayers,currentCard:currentCard,playerTurn:playerTurn,turn:true,options:options,mainChannel:mainChannel.id,category:category.id,code:Date.now(),server:unoMessage.guild.id,creator:creatorId,unoMessage:unoMessage.id,unoMessageChannel:unoMessage.channel.id}
                console.log(data)
                unoGames.push(data)
                 safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
                 console.log("NextTurn1")
                nextTurnUno(data)
      } 

module.exports = {
    start(){
      
        client = this.client
        ipc = this.electron.ipcMain
        Canvas = this.canvas.Canvas
        Discord = this.discord
        serverPrefix = this.prefix
        dataFolder = this.dataFolder
        if (fs.existsSync(dataFolder+"/webpage-data/config.json")){
            console.log(JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8")))
            binchannel = JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8")).binchannel
        }
        unoCards = JSON.parse(fs.readFileSync(this.location+"/back-end/gameData/uno/cards.json", "utf8"));
        client.on("message",async function(message){
            console.log(JSON.parse(fs.readFileSync(dataFolder+"/webpage-data/config.json","utf-8")))
            
            if (message.content.toLowerCase() == "uno"){
                if (unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id)){
                   var thisGame = unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id)
                               if (thisGame.playingPlayers.find(player=>player.id==message.author.id).cards.length ==1 || (thisGame.playingPlayers.find(player=>player.id==message.author.id).cards.length ==2 && thisGame.playerTurn==message.author.id)){
                                 thisGame.playingPlayers.find(player=>player.id==message.author.id).uno = true
                                 await client.channels.cache.get(thisGame.playingPlayers.find(element=>element.id==message.author.id).channel).send({embed:{
                                   "title":"Uno",
                                   "description": "Vous venez de dire uno!"
                                 }})
                                 await client.channels.cache.get(thisGame.mainChannel).send({embed:{
                               "title":"Uno",
                               "description": "<@"+message.author.id+"> a dit uno!",
                               "thumbnail":{"url":thisGame.currentCard.url}
                             }})
                               }
                }
             }
             if (message.content.startsWith(serverPrefix+"uno") && message.content!=serverPrefix+"uno"){
                if (message.content.startsWith(serverPrefix+"uno stop")){
                  if (message.member.hasPermission("ADMINISTRATOR")){
                    if (unoGames.find(element=>element.server == message.guild.id)){
                      var data = unoGames.find(element=>element.server == message.guild.id)
                      if (client.channels.cache.has(data.mainChannel)){
                       await client.channels.cache.get(data.mainChannel).delete()
                      }
                     for (var i in data.playingPlayers){
                       if(client.channels.cache.get(data.playingPlayers[i].channel)){
                         await client.channels.cache.get(data.playingPlayers[i].channel).delete()
                       }
                     }
                      if (client.channels.cache.get(data.playingPlayers[i].category)){
                       await client.channels.cache.get(data.playingPlayers[i].category).delete()
                      }
                         message.channel.send("La partie de uno a bien été stoppée")
                       }else{
                         message.channel.send("Il n'y a aucune partie de Uno en cours")
                       }
                  }else{
                    message.channel.send("Vous devez être administrateur de ce serveur pour utiliser cette commande")
                  }
                }
               if (message.content.startsWith(serverPrefix+"uno leave")){
                 if (unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id)){
                   var thisGame = unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id)
                   if (client.channels.cache.has(thisGame.playingPlayers.find(player=>player.id==message.author.id).channel)){
                     client.channels.cache.get(thisGame.playingPlayers.find(player=>player.id==message.author.id).channel).delete()
                   
                   }
                   if (client.channels.cache.has(thisGame.mainChannel)){
                     client.channels.cache.get(thisGame.mainChannel).send("<@"+message.author.id+"> a quitté la partie")
                   } 
                   thisGame.playingPlayers.splice(thisGame.playingPlayers.findIndex(player=>player.id==message.author.id),1)
                   if (thisGame.playingPlayers.length==0){
                     unoGames.splice(unoGames.findIndex(game=>game.code==thisGame.code),1)
                     if (client.channels.cache.has(thisGame.mainChannel)){
                     client.channels.cache.get(thisGame.mainChannel).delete()
                   }
                     if (client.channels.cache.has(thisGame.category)){
                     client.channels.cache.get(thisGame.category).delete()
                   } 
                   }  
                   if (thisGame.playingPlayers.length!=0 && message.author.id==thisGame.playerTurn){
                     thisGame.nextPlayer = thisGame.playingPlayers[Math.floor(Math.random()*thisGame.playingPlayers.length)]
                     nextTurnUno(thisGame)
                   } 
                    if (thisGame.playingPlayers.length!=0 && message.author.id==thisGame.nextPlayer.id){
                      if (thisGame.turn){ 
                         var nextPlayerIndex = parseInt(thisGame.playingPlayers.findIndex(element=>element.id==thisGame.playerTurn))+1
                         console.log(nextPlayerIndex)
                         if (nextPlayerIndex >= thisGame.playingPlayers.length){
                           nextPlayerIndex=0
                         }
                         thisGame.nextPlayer = thisGame.playingPlayers[nextPlayerIndex]
                       }else{
                         var nextPlayerIndex = parseInt(thisGame.playingPlayers.findIndex(element=>element.id==thisGame.playerTurn))-1
                         if (nextPlayerIndex <0){
                           nextPlayerIndex=thisGame.playingPlayers.length-1 
                         }
                         thisGame.nextPlayer = thisGame.playingPlayers[nextPlayerIndex]
                       } 
                     }
                   safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
                   message.channel.send("Vous avez bien quitté cette partie")
                 }else{
                   message.channel.send("Vous ne faites pas parti d'une partie dans ce serveur")
                 }
               }
               if (message.content.startsWith(serverPrefix+"uno kick")){
                 if (unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id && game.creator == message.author.id)){
                   var thisGame = unoGames.find(game=>game.playingPlayers.find(player=>player.id==message.author.id) && game.server == message.guild.id && game.creator == message.author.id)
                   if (message.mentions.users && message.mentions.users.first() && thisGame.playingPlayers.find(player=>player.id == message.mentions.users.first().id)){
                     var thisPlayerData = thisGame.playingPlayers.find(player=>player.id == message.mentions.users.first().id)
                   if (client.channels.cache.has(thisPlayerData.channel)){
                     client.channels.cache.get(thisPlayerData.channel).delete()
                   
                   }
                   if (client.channels.cache.has(thisGame.mainChannel)){
                     client.channels.cache.get(thisGame.mainChannel).send("<@"+message.author.id+"> a été kick de la partie")
                   }
                   thisGame.playingPlayers.splice(thisGame.playingPlayers.findIndex(player=>player.id == message.mentions.users.first().id),1)
                   if (thisGame.playingPlayers.length==0){
                     unoGames.splice(unoGames.findIndex(game=>game.code==thisGame.code),1)
                     if (client.channels.cache.has(thisGame.mainChannel)){
                     client.channels.cache.get(thisGame.mainChannel).delete()
                   }
                     if (client.channels.cache.has(thisGame.category)){
                     client.channels.cache.get(thisGame.category).delete()
                   }
                   }  
                   if (thisGame.playingPlayers.length!=0 && thisPlayerData.id==thisGame.playerTurn){
                     thisGame.nextPlayer = thisGame.playingPlayers[Math.floor(Math.random()*thisGame.playingPlayers.length)]
                     nextTurnUno(thisGame)
                   } 
                     if (thisGame.playingPlayers.length!=0 && thisPlayerData.id==thisGame.nextPlayer.id){
                      if (thisGame.turn){ 
                         var nextPlayerIndex = parseInt(thisGame.playingPlayers.findIndex(element=>element.id==thisGame.playerTurn))+1
                         console.log(nextPlayerIndex)
                         if (nextPlayerIndex >= thisGame.playingPlayers.length){
                           nextPlayerIndex=0
                         }
                         thisGame.nextPlayer = thisGame.playingPlayers[nextPlayerIndex]
                       }else{
                         var nextPlayerIndex = parseInt(thisGame.playingPlayers.findIndex(element=>element.id==thisGame.playerTurn))-1
                         if (nextPlayerIndex <0){
                           nextPlayerIndex=thisGame.playingPlayers.length-1 
                         }
                         thisGame.nextPlayer = thisGame.playingPlayers[nextPlayerIndex]
                       } 
                     }
                   safeSaveData("./data/games/uno.json", JSON.stringify(unoGames))
                   message.channel.send("Ce joueur a bien été kick")
                   }
                 }else{
                   message.channel.send("Vous devez être créateur d'une partie de uno pour utiliser cette commande")
                 }
               }
             }
             if (message.content==serverPrefix+"uno"){
                 if (!binchannel) return message.channel.send("Vous n'avez pas ajouté de salon dans la configuration du salon poubelle")
               var players = []
              var playerTurn = ""
               var gameStart = false
               var turn = true
               var cardStack = false
               var nextTurnAction = {}
               var currentCard = {}
                     var playingPlayers = []
              
               message.guild.members.fetch()
               var unoMessage = await message.channel.send({"embed":{
                  title: "Une partie de Uno va commencer!",
                  description:"Appuyez sur 👍 pour rejoindre/quitter la partie!",
                }})
                 await unoMessage.react("👍")
               await unoMessage.react("⏯️")
               await unoMessage.react("💵")
                 var Collector =unoMessage.createReactionCollector((reaction,user)=>user.bot==false);
                 Collector.on('collect', async(reaction,user) => {
                   if (reaction.emoji.toString()=="👍" && gameStart == false){
                     if (!players.find(element=>element==user.id)){
                       players.push(user.id)
                     }else{
                       players.splice(players.findIndex(element=>element==user.id),1)
                     }
                     var playersText = ""
                     for (var i in players){
                       console.log(players)
                       playersText+=client.users.cache.get(players[i]).tag+"\n"
                     }
                     var optionsText = "\n"
                     if (cardStack == false){
                       optionsText+="💵 Addition de cartes **Désactivé**"
                     }else{
                       optionsText+="💵 Addition de cartes **Activé**"
                     }
                     unoMessage.edit({"embed":{
                      title: "Une partie de Uno va commencer!",
                      description:"Appuyez sur 👍 pour rejoindre la partie!\n\n**__Joueurs__**:\n"+playersText+optionsText,
                    }})
                   }
                   if (reaction.emoji.toString()=="💵" && user.id == message.author.id){
                     if (cardStack){
                       cardStack = false
                     }else{
                       cardStack = true
                     }
                     var playersText = ""
                     for (var i in players){
                       console.log(players)
                       playersText+=client.users.cache.get(players[i]).tag+"\n"
                     }
                     var optionsText = "\n"
                     if (cardStack == false){
                       optionsText+="💵 Addition de cartes **Désactivé**"
                     }else{
                       optionsText+="💵 Addition de cartes **Activé**"
                     }
                     unoMessage.edit({"embed":{
                      title: "Une partie de Uno va commencer!",
                      description:"Appuyez sur 👍 pour rejoindre la partie!\n\n**__Joueurs__**:\n"+playersText+optionsText,
                    }})
                   }
                   if (reaction.emoji.toString()=="👀" ){
                     //message.member.roles.add("718023184502358017")
                   } 
                   if (reaction.emoji.toString()=="⏯️" && gameStart == false && user.id == message.author.id){
                     gameStart = true
                     startGameUno(unoMessage,players,{cardStack:cardStack},message.author.id)
                     
                   }
                 })
             }
        })
    }
}