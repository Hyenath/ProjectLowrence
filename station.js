document.addEventListener('DOMContentLoaded', () => {
    const fetchDataButton = document.getElementById('fetchData');
    const clearDataButton = document.getElementById('clearData');
    const resultText = document.getElementById('resultText');

    // Fonction pour récupérer une localisation GPS depuis une base de données via une API
    const fetchGpsLocation = async () => {
        try {
            const response = await fetch('http://192.168.64.207:3000'); // URL de votre API
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json(); // Attend une réponse JSON de l'API
            return `ID: ${data.id}, Latitude: ${data.latitude}, Longitude: ${data.longitude}, Lieu: ${data.description}`;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return 'Erreur lors de la récupération des données.';
        }
    };

    // Récupération de la localisation GPS
    fetchDataButton.addEventListener('click', async () => {
        const gpsLocation = await fetchGpsLocation();
        resultText.textContent = gpsLocation;
    });

    // Efface les données affichées
    clearDataButton.addEventListener('click', () => {
        resultText.textContent = "Aucune donnée GPS reçue pour l'instant.";
    });
});
