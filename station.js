document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchData');
    const clearDataButton = document.getElementById('clearData');
    const resultText = document.getElementById('resultText');

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

            return `ID: ${data.id}, Latitude: ${data.latitude}, Longitude: ${data.longitude}`;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return `Erreur : ${error.message}`;
        }
    };

    // Gestion du clic sur le bouton pour récupérer une trame aléatoire
    fetchDataButton.addEventListener('click', async () => {
        const gpsLocation = await fetchGpsLocation();
        resultText.textContent = gpsLocation; // Afficher les données reçues ou l'erreur
    });

    // Gestion du clic sur le bouton pour effacer les données affichées
    clearDataButton.addEventListener('click', () => {
        resultText.textContent = "Aucune trame reçue pour l'instant."; // Réinitialise l'affichage
        alert('Les données ont été effacées.'); // Alerte pour confirmer l'effacement
    });
});
