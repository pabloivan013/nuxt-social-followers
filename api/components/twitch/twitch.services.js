const { LocalStorage } = require('node-localstorage')
var localStorage = new LocalStorage('./tokens')
const fetch = require('node-fetch')
const { twitchClientId, twitchClientSecret } = require('../../config/env.dev')
const ApiResponse = require('../../utils/api.response')

var twitchServices = {}

const TWITCH_URL = 'https://www.twitch.tv/'

const PARAM_NAME = {
    LOGIN : 'login',
    ID    : 'id'
}

const ENDPOINTS = {
    USER_DATA     : 'https://api.twitch.tv/helix/users?',
    STREAM_STATUS : 'https://api.twitch.tv/helix/streams?user_login=',
    USER_FOLLOWING: 'https://api.twitch.tv/helix/users/follows?from_id=',
    USER_FOLLOWERS: 'https://api.twitch.tv/helix/users/follows?to_id='
}

twitchServices.PARAM_NAME = PARAM_NAME
twitchServices.ENDPOINTS  = ENDPOINTS
twitchServices.storage    = localStorage

twitchServices.validateAccessToken = async function(token) {
    let valid = false
    status = await fetch('https://id.twitch.tv/oauth2/validate', {
                method:'GET',
                headers: {'Authorization': `OAuth ${token}`}
            })
            .then(res =>{
                if (res.ok)
                    valid = true
                return res.json()
            })
    console.log("status: ", status)
    return valid
}

twitchServices.generateAccessToken = async function() {
    try {
        var url = `https://id.twitch.tv/oauth2/token`+
                  `?client_id=${twitchClientId}`+
                  `&client_secret=${twitchClientSecret}`+
                  `&grant_type=client_credentials`
        var data = await fetch(url, 
                                {method: 'POST'})
                                .then(res => res.json())
        console.log("data: ", data)

        if (data.access_token) {
                localStorage.setItem('token', data.access_token)
        }

        return data
      } catch (error) {
        console.log("ERROR: ", error)
        return {error:'error'}
      }
}

function generateHeader(){
    let header = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Client-Id': twitchClientId
    }
    return header
}

/**
 * 
 * @param {Object} data 
 */
function generateDataResponse(data) {

    let response = data.map( user => {
        return {
            username         : user.display_name,
            user_id          : user.id,
            profile_image_url: user.profile_image_url,
            page_url         : TWITCH_URL + user.login,
            platform         : 'twitch'
        }
    })
    return response
}

/**
 * 
 * @param {ENDPOINTS} endpoint 
 * @param {Array} arrayData 
 */
function generateUsersIdArray(endpoint, arrayData) {
    let usersIds = arrayData.map( (data) => {
        switch (endpoint) {
            case ENDPOINTS.USER_FOLLOWING:
                return data.to_id
            case ENDPOINTS.USER_FOLLOWERS:
                return data.from_id
            default:
                return data
        }
    })
    return usersIds
}

/**
 * 
 * @param {Object} userData 
 * @param {Object} extraData 
 * @param {ENDPOINTS} endpoint 
 */
function addExtraData(endpoint, userData, extraData) {
    userData.forEach( user => {
        user.followed_at = ''
        
        let extra = extraData.find(x => {
            let extraUserId
            switch (endpoint) {
                case ENDPOINTS.USER_FOLLOWING:
                    extraUserId = x.to_id
                    break;
                case ENDPOINTS.USER_FOLLOWERS:
                    extraUserId = x.from_id
                    break
                default:
                    break;
            }
            return extraUserId === user.user_id
        })
        
        if (extra != undefined) {
            user.followed_at = extra.followed_at
        }
    })
    return userData
}

/**
 * 
 * @param {ENDPOINTS}  endpoint
 * @param {Array}      queryData 
 * @param {String}     queryParamName
 * @param {String}     cursor 
 */
function generateUrlQuery(endpoint, queryData, queryParamName=undefined, cursor=undefined) {
    let url = ''
    switch (endpoint) {
        case ENDPOINTS.USER_DATA:
            url = endpoint + `${queryParamName}=` + queryData.join(`&${queryParamName}=`)
            break
        case ENDPOINTS.STREAM_STATUS:
            url = endpoint + queryData
            break
        case ENDPOINTS.USER_FOLLOWERS:
        case ENDPOINTS.USER_FOLLOWING:
            url =  endpoint + queryData + '&first=50'//QueryData = id 
            break;
        default:
            break;
    }
   
    url = cursor ? url + `&after=${cursor}` : url
    return url
}

/**
 * 
 * @param {ENDPOINTS}  endpoint 
 * @param {Array}      queryData 
 * @param {String}     queryParamName
 * @param {String}     cursor 
 * @returns {ApiResponse}
 */
twitchServices.fetch = async function(endpoint, queryData, queryParamName=undefined, cursor=undefined) {
    try {
        let response = new ApiResponse()

        let url = generateUrlQuery(endpoint, queryData, queryParamName, cursor)
        let headers = generateHeader()

        let fetchResponse = await fetch(url, {method:'GET', headers: headers}).then(res => res.json())
        
        if (fetchResponse.error) {
            response.success = false
            response.error = fetchResponse.error
            return response
        }

        response.success = true
        let data = fetchResponse.data
        if (Array.isArray(data)) { //
            switch (endpoint) {
                case ENDPOINTS.USER_DATA:
                    if (data.length)
                        response.data = generateDataResponse(data)
                    break;
                case ENDPOINTS.STREAM_STATUS:
                    response.data = data
                    break;
                case ENDPOINTS.USER_FOLLOWERS:
                case ENDPOINTS.USER_FOLLOWING:
                    let aux_data = {}
                    
                    aux_data.total = fetchResponse.total
                    aux_data.cursor = fetchResponse.pagination.cursor ? fetchResponse.pagination.cursor : 'end'
                    
                    if (data.length) {
                        let follow_array = generateUsersIdArray(endpoint, data)
                        let follow_resp = await twitchServices.fetch(ENDPOINTS.USER_DATA, 
                                                                    follow_array, 
                                                                    PARAM_NAME.ID)
                     
                        if (follow_resp.success && follow_resp.data) {
                            aux_data.info = addExtraData(endpoint, follow_resp.data, data)
                            // Sort by follow_at descending
                            aux_data.info.sort((a,b)=>{
                                return new Date(b.followed_at) - new Date(a.followed_at)
                            })
                        }
                    }
                    
                    response.data = aux_data
                    break
                default:
                    break;
            }
        }
        
        return response
    } catch (error) {
        console.log("ERROR twitchServices.fetch: ", error)
        response.success = false
        response.error   = "Error fetch"
        return response
    }
}

module.exports = twitchServices