const jwt = require('jsonwebtoken');



///////////////////////////////
// AUTHENTIFICATION'S TOKEN
///////////////////////////////
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Isole le token contenu dans la requête
    req.token = jwt.verify(token, process.env.JWT_SECRET_KEY); // Vérifie la validité du token, le décode et le place dans req.token
    next()
  } catch (error) {
    res.status(401).json({
      error: error
    })
  }
};