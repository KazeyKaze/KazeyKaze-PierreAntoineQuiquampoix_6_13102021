const jwt = require('jsonwebtoken');



///////////////////////////////
// AUTHENTIFICATION'S TOKEN
///////////////////////////////
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Isole le token contenu dans la requête
    req.token = jwt.verify(token, process.env.JWT_SECRET_KEY); // Décode le token et le place dans req.token
    if (req.body.userId && req.body.userId !== req.token.userId) { // Si il y a un userId et qu'il est différent du userId décodé
      throw 'Invalid user ID'; // Alors il envoie un message d'erreur et annule la requête
    } else {
      next(); // Sinon, il passe à l'instruction suivante
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};