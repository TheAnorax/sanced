const express = require('express');
const router = express.Router();
const { validarDevUser } = require('../appcontrollers/devUsersController');

router.post('/validar', validarDevUser);

module.exports = router;