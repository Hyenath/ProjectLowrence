// Importation des modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

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
        console.log("CPT");
        throw err;
    }
    console.log('Connecté à la base de données');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur ${PORT}`);
});

// Route d'inscription corrigée
app.post('/register', (req, res) => {
    const { login, password, email } = req.body;

    if (!login || !password || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe.' });
        }

        const sql = 'INSERT INTO User (login, password, email) VALUES (?, ?, ?)';
        db.query(sql, [login, hash, email], (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'insertion des données :', err);
                return res.status(500).json({ error: 'Erreur serveur.' });
            }
            res.status(201).json({ message: 'Utilisateur créé avec succès!' });
        });
    });
});

// Route de connexion corrigée
app.post('/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const sql = 'SELECT * FROM User WHERE login = ?';
    db.query(sql, [login], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
            }
            res.status(200).json({ message: 'Connexion réussie!' });
        });
    });
});

app.get('/getTrame', (req, res) => {
    const query = 'SELECT * FROM Trame ORDER BY RAND() LIMIT 1';

    db.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'exécution de la requête:', error);
            res.status(500).json({ error: 'Erreur serveur lors de la récupération des données.' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Aucune donnée disponible dans la table Trame.' });
        } else {
            res.json(results[0]);
        }
    });
});