const express = require('express');
const router = express.Router();
const sauceCtrlsauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



///////////////////////////////
// ROUTER
///////////////////////////////
router.post('/', auth, multer, sauceCtrlsauceCtrl.createSauce);
router.post('/:id/like', auth, sauceCtrlsauceCtrl.like);
router.put('/:id', auth, multer, sauceCtrlsauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrlsauceCtrl.deleteSauce);
router.get('/', auth, sauceCtrlsauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrlsauceCtrl.getOneSauce);



module.exports = router;