// Importation des modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialisation de l'application Express
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'lowrenceUser',
    password: 'LowrencePASSWORD',
    database: 'Lowrence'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données');
});

// Route d'inscription
app.post('/register', (req, res) => {
    const { login, password, email } = req.body;

    // Vérification des champs requis
    if (!login || !password || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Hachage du mot de passe
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Erreur lors du hachage du mot de passe :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }

        // Insertion de l'utilisateur dans la base de données
        const sql = 'INSERT INTO User (login, password, email) VALUES (?, ?, ?)';
        db.query(sql, [login, hash, email], (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'insertion des données :', err);
                return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
            }
            res.status(201).json({ message: 'Utilisateur créé avec succès!' });
        });
    });
});

// Route de connexion
app.post('/login', (req, res) => {
    const { login, password } = req.body;

    // Vérification des champs requis
    if (!login || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Rechercher l'utilisateur dans la base de données
    const sql = 'SELECT * FROM User WHERE login = ?';
    db.query(sql, [login], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête SQL :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        const user = results[0];
        // Comparaison du mot de passe haché
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la vérification du mot de passe :', err);
                return res.status(500).json({ error: 'Erreur interne du serveur.' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
            }

            res.status(200).json({ message: 'Connexion réussie!' });
        });
    });
});

// Route pour récupérer la dernière trame
app.get('/getTrame', (req, res) => {
    const query = 'SELECT * FROM Trame ORDER BY Date DESC LIMIT 1';

    db.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'exécution de la requête :', error);
            return res.status(500).json({ error: 'Erreur interne du serveur.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Aucune donnée disponible dans la table Trame.' });
        }

        res.json(results[0]);
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
