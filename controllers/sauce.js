const Sauce = require('../models/sauce');
const fs = require('fs');
const jwt = require('jsonwebtoken');



///////////////////////////////
// POST
///////////////////////////////
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({
            message: 'Sauce enregistré !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
};

///////////////////////////////
// GET BY ID
///////////////////////////////
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

///////////////////////////////
// PUT
///////////////////////////////
exports.modifySauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            if (sauce.userId === req.token.userId) { // Vérification de l'égalité entre le userId de la sauce et celui du token
                const sauceObject = req.file ? {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : {
                    ...req.body
                };
                Sauce.updateOne({
                        _id: req.params.id
                    }, {
                        ...sauceObject,
                        _id: req.params.id
                    })
                    .then(() => res.status(200).json({
                        message: 'Sauce modifié !'
                    }))
                    .catch(error => res.status(400).json({
                        error
                    }));
            } else {
                res.status(403).json({
                    message: '403: unauthorized request !'
                })
            }
        });
}

///////////////////////////////
// DELETE
///////////////////////////////
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            if (sauce.userId === req.token.userId) { // Vérification de l'égalité entre le userId de la sauce et celui du token
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({
                            _id: req.params.id
                        })
                        .then(() => res.status(200).json({
                            message: 'Objet supprimé !'
                        }))
                        .catch(error => res.status(400).json({
                            error
                        }));
                });
            } else {
                res.status(403).json({
                    message: '403: unauthorized request !'
                })
            };
        })
        .catch(error => res.status(500).json({
            error
        }));
}

///////////////////////////////
// GET ALL
///////////////////////////////
exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

///////////////////////////////
// LIKE
///////////////////////////////
exports.like = (req, res, next) => {
    const userId = req.body.userId; // Constante créée afin de réduire et clarifier le code du switch

    Sauce.findOne({ // Je cible ma sauce
            _id: req.params.id
        })
        .then(sauce => {
            switch (req.body.like) {
                case 0: // Si l'état du like est nul
                    if (sauce.usersLiked.includes(userId)) sauce.usersLiked = sauce.usersLiked.filter(user => user !== userId); // Je vérifie et corrige le tableau en retirant le userId des likes
                    if (sauce.usersDisliked.includes(userId)) sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userId); // Je vérifie et corrige le tableau en retirant le userId des dislikes
                    break;
                case 1: // Si l'état du like est like
                    if (!sauce.usersLiked.includes(userId)) sauce.usersLiked.push(userId); // Je vérifie et corrige le tableau en ajoutant le userId dans les likes
                    if (sauce.usersDisliked.includes(userId)) sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userId); // Je vérifie et corrige le tableau en retirant le userId des dislikes
                    break;
                case -1: // Si l'état du like est dislike
                    if (sauce.usersLiked.includes(userId)) sauce.usersLiked = sauce.usersLiked.filter(user => user !== userId); // Je vérifie et corrige le tableau en retirant le userId des likes
                    if (!sauce.usersDisliked.includes(userId)) sauce.usersDisliked.push(userId); // Je vérifie et corrige le tableau en ajoutant le userId dans les dislikes
                    break;
                default:
                    res.status(400).json({
                        message: 'Bad request'
                    });
            }

            sauce.likes = sauce.usersLiked.length; // Le compteur de likes est égale au nombre d'utilisateurs contenu le tableau des utilisateurs qui ont aimé
            sauce.dislikes = sauce.usersDisliked.length; // Le compteur de dislikes est égale au nombre d'utilisateurs contenu le tableau des utilisateurs qui n'ont pas aimé

            Sauce.updateOne({ // Puis je mets la sauce à jour
                    _id: req.params.id
                }, sauce)
                .then(res.status(200).json({
                    message: 'Sauce notée !'
                }))
                .catch((error) => res.status(404).json({
                    error
                }));
        })
        .catch(error => res.status(500).json({
            message: error.message
        }));
};