var client,dataFolder,electron,ipcRenderer
const weather = require("weather-js")
module.exports = {
    start(){
        client = this.client
        dataFolder = this.dataFolder
        electron = this.electron
        ipcRenderer = this.ipcRenderer
        prefix = this.prefix
        client.on("message",function(message){
            if (message.content.startsWith(prefix+"weather"))
            if (message.content.startsWith(prefix+"weather ") && message.content.split(prefix+"weather ")[1]){
                var city = message.content.split(prefix+"weather ")[1]
                         weather.find({search: city, degreeType: 'C'}, function(err, result) {
                if(err) message.channel.send("Une erreur est survenue!");
                if (result.length != 0){
                    var dataResult = result[0]
                    var englishToFrench = {"Cloudy":"Nuageux","Mostly Cloudy":"Partiellement nuageux","Sunny":"Ensoleillé","Rain Showers":"Averse","Mostly Sunny":"Partiellement ensoleillé","Light Rain":"Pluie"}
                    var skyText = dataResult.current.skytext
                    if (englishToFrench[skyText]){
                        skyText = englishToFrench[skyText]
                    }
                    console.log(dataResult)
                    console.log(dataResult.current.imageUrl)
                    message.channel.send({"embed":{
                        "title":"Météo de "+dataResult.location.name,
                        "description":"Temps: **"+skyText+"**\nTempérature: **"+dataResult.current.temperature+" °C**\nTempérature ressentie: **"+dataResult.current.feelslike+" °C**\nHumidité: **"+dataResult.current.humidity+"%**\nVitesse du vent: **"+dataResult.current.windspeed+"**",
                        "thumbnail":{"url":dataResult.current.imageUrl}
                    }})
                }else{
                    message.channel.send("Cette ville n'a pas été trouvée")
                }
              });
                 
            }else{
                message.channel.send("Veuillez inclure un nom de ville")
            }
        })
    }
}