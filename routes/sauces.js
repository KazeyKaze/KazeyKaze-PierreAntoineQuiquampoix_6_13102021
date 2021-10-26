const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



///////////////////////////////
// ROUTER
///////////////////////////////
router.post('/', auth, multer, stuffCtrl.createSauce);
router.put('/:id', auth, multer, stuffCtrl.modifySauce);
router.delete('/:id', auth, stuffCtrl.deleteSauce);
router.get('/', auth, stuffCtrl.getAllSauces);
router.get('/:id', auth, stuffCtrl.getOneSauce);



module.exports = router;