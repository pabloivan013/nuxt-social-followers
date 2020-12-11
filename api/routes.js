const express = require('express')
const router = express.Router()

var twitchRoutes = require('./components/twitch/twitch.routes')

/*** API Routes ***/

router.use('/twitch', twitchRoutes)

module.exports = router