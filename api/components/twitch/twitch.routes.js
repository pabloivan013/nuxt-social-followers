const express = require('express')
const router = express.Router()
const twitchController = require('./twitch.controller')

router.get('/token', twitchController.token)

router.get('/data', twitchController.data)

router.get('/followers', twitchController.followers)

router.get('/following', twitchController.following)

module.exports = router