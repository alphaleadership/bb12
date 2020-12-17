// Import needed

const ipcRenderer = parent.ipcRenderer;
let configData = {};

console.log("loading ext")
if (typeof ipcRenderer != "undefined") {
    ipcRenderer.send("getConfigData", {"botId": parent.currentBotOpenId, "extensionId": "custom-msg-ext"});
    ipcRenderer.on("getConfigData", async function (e, config) {
        console.log("Received data");
        console.log("Checking data version");
        console.log(config[" "]);
        if (typeof config[" "] == "undefined") {
            Swal.fire({
                title: "Hmm, c'est embêtant.",
                text: "La version de la base de données n'est actuellement pas à jour. On a besoin de supprimer toutes tes commandes pour pouvoir la mettre à jour... Est-ce que tu es ok avec ça ?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, vas y !",
                cancelButtonText: "Je vais m'en passer."
            }).then(result => {
                if (result.isConfirmed) {
                    console.log("Working...");
                    ipcRenderer.send("saveConfigData", {"config": {" ": []}, "extensionId": "custom-msg-ext", "botId": parent.currentBotOpenId});
                    Swal.fire(
                        "C'est bon !",
                        "On a mis a jour la version de la db. Toutes les commandes ont été malheureusement supprimées, mais haut les coeurs ! Tu peux les recréer dès maintenant.",
                        "success",
                    );
                } else {
                    Swal.fire({
                        title: "T'es sûr ?",
                        text: "C'est vraiment important, tu pourras pas avoir accès à la liste des commandes sinon...",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "En fait, je vais peut être accepter.",
                        cancelButtonText: "Non, je veux vraiment pas faire cette maj..."
                    }).then(result => {
                        if (result.isConfirmed) {
                            console.log("Working...");
                            ipcRenderer.send("saveConfigData", {"config": {" ": []}, "extensionId": "custom-msg-ext", "botId": parent.currentBotOpenId});
                            Swal.fire(
                                "C'est bon !",
                                "On a mis a jour la version de la db. Toutes les commandes ont été malheureusement supprimées, mais haut les coeurs ! Tu peux les recréer dès maintenant.",
                                "success",
                            );
                        } else {
                            Swal.fire({
                                title: "Okay...",
                                text: "On n'a pas effectué la mise à jour. La demande se refera chaque fois que tu changeras de page.",
                                footer: "Tu n'as pas accès à la page de liste de commandes. (l'extension est quand même prête)",
                                confirmButtonText: "C'est noté, retraité.",
                            });
                        }
                    });
                }
            });
            return;
        }
        configData = config;
    });
}

const pjsConf = {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
}

particlesJS('pjs', pjsConf);