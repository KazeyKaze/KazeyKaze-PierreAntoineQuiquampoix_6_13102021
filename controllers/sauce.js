const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');



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
    const thingObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {
        ...req.body
    };
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...thingObject,
            _id: req.params.id
        })
        .then(() => res.status(200).json({
            message: 'Sauce modifié !'
        }))
        .catch(error => res.status(400).json({
            error
        }));
};

///////////////////////////////
// DELETE
///////////////////////////////
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
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
        })
        .catch(error => res.status(500).json({
            error
        }));
};

///////////////////////////////
// GET ALL
///////////////////////////////
exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (things) => {
            res.status(200).json(things);
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
    const userId = req.body.userId;

    Sauce.findOne({
            _id: req.params.id
        })
        .then(sauce => {
            switch (req.body.like) {
                case 0:
                    if (sauce.usersLiked.includes(userId)) sauce.usersLiked = sauce.usersLiked.filter(user => user !== userId);
                    if (sauce.usersDisliked.includes(userId)) sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userId);
                    break;
                case 1:
                    if (!sauce.usersLiked.includes(userId)) sauce.usersLiked.push(userId);
                    if (sauce.usersDisliked.includes(userId)) sauce.usersDisliked = sauce.usersDisliked.filter(user => user !== userId);
                    break;
                case -1:
                    if (sauce.usersLiked.includes(userId)) sauce.usersLiked = sauce.usersLiked.filter(user => user !== userId);
                    if (!sauce.usersDisliked.includes(userId)) sauce.usersDisliked.push(userId);
                    break;
                default:
                    res.status(400).json({
                        message: 'Bad request'
                    });
            }

            sauce.likes = sauce.usersLiked.length;
            sauce.dislikes = sauce.usersDisliked.length;

            Sauce.updateOne({
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