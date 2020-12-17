setTimeout(() => {
    const d = [];
    configData[" "].forEach(cmd => {
        console.log(`Found cmd ${cmd}`);
        d.push(`<a href="cmd.html?id=${cmd}">${cmd}</a>`)
    })
    document.getElementById("title").innerHTML = "Regardez l'alertbox !";
    document.getElementById("nosee").style.display = "block";
    Swal.fire({
        title: "Liste des commandes",
        html: d.join("<br/>"),
    });
}, 100);

function noSee(){
    const d = [];
    configData[" "].forEach(cmd => {
        console.log(`Found cmd ${cmd}`);
        d.push(`<a href="cmd.html?id=${cmd}">${cmd}</a>`)
    })
    document.getElementById("title").innerHTML = "Regardez l'alertbox !";
    document.getElementById("nosee").style.display = "block";
    Swal.fire({
        title: "Liste des commandes",
        html: d.join("<br/>"),
    });
}