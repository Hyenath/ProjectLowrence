document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchData');
    const clearDataButton = document.getElementById('clearData');
    const resultText = document.getElementById('resultText');

    let map; // Variable pour stocker la carte Leaflet

    // Fonction pour récupérer une trame aléatoire depuis l'API
    const fetchGpsLocation = async () => {
        resultText.textContent = "Chargement..."; // Afficher un message de chargement pendant la récupération
        try {
            const response = await fetch('http://192.168.64.207:3000/getTrame'); // URL de votre API

            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La réponse n\'est pas au format JSON.');
            }

            const data = await response.json(); // Attend une réponse JSON de l'API

            // Vérification des données reçues
            if (!data.id || !data.latitude || !data.longitude) {
                throw new Error('Données incomplètes reçues.');
            }

            return data; // Renvoie l'objet data directement
        } catch (error) {
            console.error('Erreur lors de la récupération des données :', error);
            return { error: error.message };
        }
    };

    // Fonction pour initialiser la carte
    const initializeMap = (latitude, longitude, id) => {
        // Si la carte existe déjà, on la supprime avant d'en créer une nouvelle
        if (map) {
            map.remove();
            map = null; // Réinitialiser la variable map
        }

        // Créer une nouvelle carte Leaflet centrée sur les coordonnées données
        map = L.map('map').setView([latitude, longitude], 13); // Niveau de zoom de 13

        // Ajouter un "tile layer" pour la carte (ici OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Ajouter un marqueur sur la carte aux coordonnées GPS récupérées
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<b>ID:</b> ${id}<br><b>Latitude:</b> ${latitude}<br><b>Longitude:</b> ${longitude}`)
    };
    /////////////Faire en sorte d'appeler laposition en boucle + effacer trame = effacer map aussi ( y remédier)///////////////

    
    // Gestion du clic sur le bouton pour récupérer une trame aléatoire

    let Fetching = false; // Indicateur pour contrôler la boucle

    fetchDataButton.addEventListener('click', async () => {
        if (Fetching) return; // Si une boucle est déjà en cours, on empêche de démarrer une nouvelle boucle
        Fetching = true; // Démarre la boucle
    
        const fetchLoop = async () => {
            if (!Fetching) return; // Si l'indicateur isFetching est false, on arrête la boucle
    
            const gpsLocation = await fetchGpsLocation(); // Récupérer les données GPS
    
            if (gpsLocation.error) {
                resultText.textContent = `Erreur : ${gpsLocation.error}`; // Afficher l'erreur
            } else {
                const { id, latitude, longitude } = gpsLocation;
                resultText.textContent = `ID: ${id}, Latitude: ${latitude}, Longitude: ${longitude}`;
                initializeMap(latitude, longitude, id); // Initialiser la carte avec les coordonnées
            }
    
            // Recommencer après un délai de 5 secondes
            setTimeout(fetchLoop, 5000); // Appeler fetchLoop toutes les 5 secondes
        };
        fetchLoop(); // Démarre la boucle immédiatement
    });

    // Gestion du clic sur le bouton pour effacer les données affichées
    clearDataButton.addEventListener('click', () => {
        Fetching = false; // Arrêter la boucle
        resultText.textContent = "Aucune trame reçue pour l'instant."; // Réinitialiser le texte des résultats

        if (map) {
            map.remove(); // Supprimer la carte Leaflet
            map = null; // Réinitialiser la variable map
        }

        // Réinitialiser l'élément DOM contenant la carte
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = ''; // Supprimer le contenu du conteneur
            mapContainer.style.background = 'none'; // Supprimer tout fond
        }

        alert('Les données ont été effacées.'); // Alerte de confirmation
    });
});
