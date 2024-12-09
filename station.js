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

            return { id: data.id, latitude: data.latitude, longitude: data.longitude };
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return { error: error.message };
        }
    };

    // Fonction pour initialiser la carte
    const initializeMap = (latitude, longitude) => {
        // Si la carte existe déjà, on la supprime avant d'en créer une nouvelle
        if (map) {
            map.remove();
        }

        // Créer une nouvelle carte Leaflet centrée sur les coordonnées données
        map = L.map('map').setView([latitude, longitude], 13); // Niveau de zoom de 13

        // Ajouter un "tile layer" pour la carte (ici OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Ajouter un marqueur sur la carte aux coordonnées GPS récupérées
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`<b>ID:</b> ${data.id}<br><b>Latitude:</b> ${latitude}<br><b>Longitude:</b> ${longitude}`)
            .openPopup();
    };

    // Gestion du clic sur le bouton pour récupérer une trame aléatoire
    fetchDataButton.addEventListener('click', async () => {
        const gpsLocation = await fetchGpsLocation();
        
        if (gpsLocation.error) {
            resultText.textContent = `Erreur : ${gpsLocation.error}`; // Afficher l'erreur
        } else {
            resultText.textContent = `ID: ${gpsLocation.id}, Latitude: ${gpsLocation.latitude}, Longitude: ${gpsLocation.longitude}`;
            initializeMap(gpsLocation.latitude, gpsLocation.longitude); // Initialiser la carte avec les coordonnées
        }
    });

    // Gestion du clic sur le bouton pour effacer les données affichées
    clearDataButton.addEventListener('click', () => {
        resultText.textContent = "Aucune trame reçue pour l'instant."; // Réinitialiser le texte des résultats
        if (map) {
            map.remove(); // Effacer la carte
        }
        alert('Les données ont été effacées.'); // Alerte de confirmation
    });
});
