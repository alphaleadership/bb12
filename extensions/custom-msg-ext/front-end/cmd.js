const p = new URLSearchParams(window.location.search);
let c = p.get('id');
c = decodeURIComponent(c);

// Getting command infos
const ci = configData[c];
if (!ci) {
    window.location = "/index.html";
}
document.getElementById("name").value = c;
document.getElementById("rs").value = ci.message;

function editCmd(){
    // Retreive content
    const rss = document.getElementById("rs").value;
    console.log(rss)
    if (!rss || rss.replace(/ /g, "") == "") {
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
        text: "On modifie ?",
        showDenyButton: true,
        denyButtonText: "En fait, non.",
        confirmButtonText: "Oui, go !",
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Preparing to save");
            console.log(`Command name: ${c}`);
            console.log(`Command message: ${rss}`);
            console.log("Editing data");
            if (!configData[c]) {
                return Swal.fire({
                    title: "Désolé, mais...",
                    html: `Il n'y a aucune commande à ce nom... Il va falloir retourner sur la page de <a href="/index.html">création</a> si tu veux la créer !`,
                    confirmButtonText: "Ok !",
                });
            }
            configData[c] = {
                name: c,
                message: rss,
                enabled: true,
            };
            if (!configData[" "].includes(c)) {
                configData[" "].push(c);
            }
            console.log("Data edited");
            console.log("Sending...");
            ipcRenderer.send("saveConfigData", {"config": configData, "extensionId": "custom-msg-ext", "botId": parent.currentBotOpenId});
            console.log("Sent");
            console.log("Waiting for confirmation");
        }
    })
}

ipcRenderer.on("saveConfigData", (event, result) => {
    if (result.success) {
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
            text: "Ta commande a été éditée, on va te rediriger vers la page principale !",
            timer: 1500,
            timerProgressBar: true,
            willClose: () => {
                window.location = "index.html";
            }
        });
    }
})