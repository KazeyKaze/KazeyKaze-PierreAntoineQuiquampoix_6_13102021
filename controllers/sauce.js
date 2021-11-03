const Sauce = require('../models/sauce');
const fs = require('fs');



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
    const like = req.body.like;
    const userId = req.body.userId;

    ///////////////////////////////
    // IF LIKE
    ///////////////////////////////
    if (like == 1) {
        Sauce.updateOne({
                _id: req.params.id
            }, {
                $inc: {
                    likes: 1
                },
                $push: {
                    usersLiked: userId
                }
            })
            .then(() => res.status(200).json({
                message: 'Vous aimez cette sauce !'
            }))
            .catch(error => res.status(400).json({
                error
            }));

        ///////////////////////////////
        // IF DISLIKE
        ///////////////////////////////
    } else if (like == -1) {
        Sauce.updateOne({
                _id: req.params.id
            }, {
                $inc: {
                    dislikes: 1
                },
                $push: {
                    usersDisliked: userId
                }
            })
            .then(() => res.status(200).json({
                message: "Vous n'aimez pas cette sauce !"
            }))
            .catch(error => res.status(400).json({
                error
            }));

        ///////////////////////////////
        // IF NEUTRAL
        ///////////////////////////////
    } else if (like == 0) {
        Sauce.findOne({
                _id: req.params.id
            })
            .then((sauce) => {
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({
                            _id: req.params.id
                        }, {
                            $inc: {
                                likes: -1
                            },
                            $pull: {
                                usersLiked: userId
                            }
                        })
                        .then(() => res.status(200).json({
                            message: "Vous n'aimez plus cette sauce !"
                        }))
                        .catch(error => res.status(500).json({
                            error
                        }));
                }
                if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({
                            _id: req.params.id
                        }, {
                            $inc: {
                                dislikes: -1
                            },
                            $pull: {
                                usersDisliked: userId
                            }
                        })
                        .then(() => res.status(200).json({
                            message: "Vous aimez de nouveau cette sauce !"
                        }))
                        .catch(error => res.status(500).json({
                            error
                        }));
                }
            })
            .catch(error => res.status(500).json({
                error
            }));
    }
};