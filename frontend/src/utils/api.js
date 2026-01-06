import axios from 'axios'

// change the api endpoints url here
const BASE_URL = 'https://us-central1-fundme-project.cloudfunctions.net/api'


// create API client calls
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000
})

export const getAllCampaigns = () => api.get('/campaigns')

export const getCampaignById = (id) => api.get(`/campaigns/${id}`)

export const getDonationsByCampaignId = (campaignId) => api.get(`/campaigns/${campaignId}/donations`)

export const getDonatorsByCampaignId = (campaignId) => api.get(`/campaigns/${campaignId}/donators`)

export const getCommentsByCampaignId = (campaignId) => api.get(`/comments/${campaignId}`)

export const getOtherCampaignsByCampaignId = (campaignId) => api.get(`/campaigns/${campaignId}/other-campaigns`)

export const getFavoriteCampaigns = (token) => {
    return api.get('/favorite-campaign', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const getCreatedCampaigns = (token, userId) => {
    return api.get(`/my-campaigns/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const getDonationHistory = (token) => {
    return api.get('/donation-history', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const getFavoriteCampaignsList = (token) => {
    return api.get('/favorite-campaign-list', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const saveToFavorite = (campaignId, token) => {
    return api.post(`/favorite-campaign/${campaignId}`, {}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const removeFromFavorite = (campaignId, token) => {
    return api.delete(`/favorite-campaign/${campaignId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const postComments = (campaignId, commentData, token) => {
    return api.post(`/comments/${campaignId}`, {
        commentContent: commentData,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const postDonation = (campaignId, donationData, token) => {
    return api.post(`/donations/${campaignId}`, donationData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const addCampaign = (campaignData, token) => {
    return api.post('/campaigns', campaignData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const updateCampaign = (campaignId, campaignData, token) => {
    return api.put(`/campaigns/${campaignId}`, campaignData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export const deleteCampaign = (campaignId, token) => {
    return api.delete(`/campaigns/${campaignId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
}

export default {
    getAllCampaigns,
    getCampaignById,
    getDonationsByCampaignId,
    getDonatorsByCampaignId,
    getCommentsByCampaignId,
    getOtherCampaignsByCampaignId,
    saveToFavorite,
    removeFromFavorite,
    postComments,
    postDonation,
    getFavoriteCampaignsList,
    getFavoriteCampaigns,
    getDonationHistory,
    getCreatedCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign
}