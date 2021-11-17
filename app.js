const express = require('express');
const mongoose = require('mongoose');
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');
const helmet = require('helmet'); // Protection des headers
const rateLimit = require("express-rate-limit"); // Protection contre les attaques de force brute



///////////////////////////////
// MONGO'S CONNECTION (Données de connexion cachées grâce au .env)
///////////////////////////////
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ellto.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

///////////////////////////////
// PERMISSIONS'S CONNECTION
///////////////////////////////
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Origines des connexions autorisées (toutes)
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Headers autorisés
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Verbes autorisés
    next();
});

///////////////////////////////
// RATE LIMIT
///////////////////////////////
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limite chaque IP à 100 requêtes
});



app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use(helmet());
app.use(limiter);



module.exports = app;