const ApiResponse = require('../../utils/api.response')
const services = require('./twitch.services')

var twitchController = {}

twitchController.data = async function(req, res) {
    try {
        let response = new ApiResponse()

        let query = [req.query.username]
        response = await services.fetch(services.ENDPOINTS.USER_DATA,
                                        query, 
                                        services.PARAM_NAME.LOGIN)

        if (!response.success || !(Array.isArray(response.data) && response.data.length)) {
            return res.json(response)
        }

        // Fetch user stream status
        let userStreamStatus = await services.fetch(services.ENDPOINTS.STREAM_STATUS,
                                                    query)
        
        if (!userStreamStatus.success || !(Array.isArray(userStreamStatus.data) && userStreamStatus.data.length)) {
            return res.json(response)
        }

        // Add stream status to user data
        Object.assign(response.data[0], userStreamStatus.data[0])
        res.json(response)
    } catch (error) {
        console.log("Error twitchController.data: ", error)
        response.success = false
        response.error   = "Error twitchController.data"
        res.json(response)
    }
}

twitchController.following = async function(req, res) {
    let username = req.query.username
    let user_id  = req.query.id
    let cursor   = req.query.cursor
    let response = await services.fetch(services.ENDPOINTS.USER_FOLLOWING, 
                                        user_id, 
                                        undefined, 
                                        cursor)
    res.json(response)
}

twitchController.followers = async function(req, res) {
    let username = req.query.username
    let user_id  = req.query.id
    let cursor   = req.query.cursor
    let response = await services.fetch(services.ENDPOINTS.USER_FOLLOWERS, 
                                        user_id, 
                                        undefined, 
                                        cursor)
    res.json(response)
}

// Refresh token
twitchController.token = async function(req, res) {
    data = await services.generateAccessToken()
    if (data.access_token) {
        services.validateAccessToken(data.access_token)
    }
    res.json(data)
}

module.exports = twitchController