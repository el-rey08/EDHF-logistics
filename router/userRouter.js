const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
router.post('/signUp', userController.createUser)
router.post('/signIn', userController.login)

module.exports = router