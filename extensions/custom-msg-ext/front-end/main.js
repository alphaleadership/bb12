ipcRenderer.on("saveConfigData", (event, result) => {
    if (result.success && window.location.pathname.endsWith("index.html") && !window.location.pathname.includes("?")) {
        console.log("Confirmation received");
        console.log("Cleaning");
        document.getElementById("name").value = "";
        document.getElementById("rs").value = "";
        console.log("Cleaned");
        console.log("Sending confirmation");
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: "C'est bon !",
            text: "Ta commande a été enregistrée !",
            timer: 1500,
            timerProgressBar: true,
        });
    }
})

function addCmd(){
    // Retreive content
    const name = document.getElementById("name").value;
    console.log(name)
    const rss = document.getElementById("rs").value;
    console.log(rss)
    if (!name || !rss || name.replace(/ /g, "") == "" || rss.replace(/ /g, "") == "") {
        Swal.fire({
            icon: "error",
            title: "Hmmm...",
            text: "Merci de remplir tous les champs !",
            footer: "Et je parle pas des champs de blé."
        })
        return;
    }
    Swal.fire({
        title: "T'es sûr ?",
        text: "On enregistre ?",
        showDenyButton: true,
        denyButtonText: "En fait, non.",
        confirmButtonText: "Oui, go !",
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Preparing to save");
            console.log(`Command name: ${name}`);
            console.log(`Command message: ${rss}`);
            console.log("Editing data");
            if (configData[name]) {
                return Swal.fire({
                    title: "Désolé, mais...",
                    html: `Tu as déjà une commande à ce nom. Tu peux aller l'éditer <a href="/cmd.html?id=${name}">ici</a>, mais pas la faire deux fois.`,
                    confirmButtonText: "Ok !",
                });
            }
            configData[name] = {
                name,
                message: rss,
                enabled: true,
            };
            if (!configData[" "]) {
                configData[" "] = [ name ];
            } else {
                configData[" "].push(name);
            }
            console.log("Data edited");
            console.log("Sending...");
            ipcRenderer.send("saveConfigData", {"config": configData, "extensionId": "custom-msg-ext", "botId": parent.currentBotOpenId});
            console.log("Sent");
            console.log("Waiting for confirmation");
        }
    })
}