const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

admin.initializeApp()
const db = admin.database()

const app = express()
app.use(cors({ origin: true }))

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// Middleware: Verify Firebase ID token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (err) {
    console.error('Token verification error:', err)
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
}

// GET /campaigns - get all campaigns
app.get('/campaigns', async (req, res) => {
  try {
    const snapshot = await db.ref('campaigns').once('value')
    const campaigns = snapshot.val() || {}
    const campaignList = Object.values(campaigns)
    res.status(200).json(campaignList)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

// GET /top-campaigns - get top 3 campaigns order by target amount
app.get('/top-campaigns', async (req, res) => {
  try {
    const snapshot = await db.ref('campaigns').once('value')
    const campaigns = snapshot.val() || {}
    const campaignList = Object.values(campaigns)

    // Sort campaigns by target amount (descending) and get top 3
    const topCampaigns = campaignList
      .sort((a, b) => b.targetAmount - a.targetAmount)
      .slice(0, 3)

    res.status(200).json(topCampaigns)
  } catch (error) {
    console.error('Error fetching top campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch top campaigns' })
  }
})

// GET /campaigns/:id - get a specific campaign
app.get('/campaigns/:id', async (req, res) => {
  const campaignId = req.params.id
  try {
    const snapshot = await db.ref(`campaigns/${campaignId}`).once('value')
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Campaign not found' })
    }
    res.status(200).json(snapshot.val())
  } catch (error) {
    console.error('Error fetching campaign:', error)
    res.status(500).json({ error: 'Failed to fetch campaign' })
  }
})

// GET /my-campaigns/:id - get campaign list by user ID
app.get('/my-campaigns/:id', async (req, res) => {
  const userId = req.params.id
  try {
    const snapshot = await db.ref('campaigns').orderByChild('orgId').equalTo(userId).once('value')
    const campaigns = snapshot.val() || {}
    const campaignList = Object.values(campaigns)
    res.status(200).json(campaignList)
  } catch (error) {
    console.error('Error fetching user campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch user campaigns' })
  }
})

// POST /campaigns - create a new campaign
app.post('/campaigns', authenticate, async (req, res) => {
  const newCampaign = req.body
  try {
    const campaignId = uuidv4();

    const orgId = req.user.uid

    // find org name by scanning users tree
    const userSnap = await db.ref(`users/${orgId}`).once('value')
    const userInfo = userSnap.val()
    if (!userInfo || !userInfo.name) {
      return res.status(400).json({
        error: 'User name not found in profile'
      })
    }

    newCampaign.orgId = orgId
    newCampaign.orgName = userInfo.name
    newCampaign.id = campaignId
    newCampaign.startDate = Date.now()
    newCampaign.endDate = newCampaign.endDate
    newCampaign.current = 0 // Initialize current amount to 0
    newCampaign.isActive = true
    newCampaign.image = newCampaign.image
    newCampaign.description = newCampaign.description || ''
    newCampaign.title = newCampaign.title
    newCampaign.tags = newCampaign.tags

    await db.ref(`campaigns/${campaignId}`).set(newCampaign)


    res.status(201).json({ ...newCampaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

// PUT /campaigns/:id - update a specific campaign
app.put('/campaigns/:id', authenticate, async (req, res) => {
  const campaignId = req.params.id
  const updatedCampaign = req.body
  try {
    await db.ref(`campaigns/${campaignId}`).update(updatedCampaign)
    res.status(200).json({ id: campaignId, ...updatedCampaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    res.status(500).json({ error: 'Failed to update campaign' })
  }
})

// DELETE /campaigns/:id - delete a specific campaign
app.delete('/campaigns/:id', authenticate, async (req, res) => {
  const campaignId = req.params.id
  try {
    // check if the campaign still happening
    const campaignSnap = await db.ref(`campaigns/${campaignId}`).once('value')
    const campaignData = campaignSnap.val()
    if (!campaignData) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaignData.isActive) {
      return res.status(400).json({ error: 'Cannot delete an active campaign. Please deactivate campaign before continuing.' })
    }

    await db.ref(`campaigns/${campaignId}`).remove()
    res.status(200).json({ success: true, message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    res.status(500).json({ error: 'Failed to delete campaign' })
  }
})

// GET /campaigns/:id/other-campaigns - get other active campaigns BUT NOT the one specified by id
// limit by 3 campaigns
app.get('/campaigns/:id/other-campaigns', async (req, res) => {
  const campaignId = req.params.id
  try {
    const snapshot = await db.ref('campaigns').once('value')
    const campaigns = snapshot.val() || {}
    const campaignList = Object.values(campaigns)

    // Filter out the specified campaign
    const otherCampaigns = campaignList.filter(c => c.id != campaignId)

    res.status(200).json(shuffleArray(otherCampaigns).slice(0, 3))
  } catch (error) {
    console.error('Error fetching other campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch other campaigns' })
  }
})

//// FAVORITE CAMPAIGNS ////
// GET /favorite-campaign
app.get('/favorite-campaign', authenticate, async (req, res) => {
  const userId = req.user.uid
  try {
    const snapshot = await db.ref(`favoriteCampaign/${userId}`).once('value')
    const ids = snapshot.val() || []
    res.status(200).json(ids)
  } catch (err) {
    console.error('Failed to fetch favorites:', err)
    res.status(500).json({ error: 'Failed to get favorite campaigns' })
  }
})

app.get('/favorite-campaign-list', authenticate, async (req, res) => {
  const userId = req.user.uid
  try {
    const snapshot = await db.ref(`favoriteCampaign/${userId}`).once('value')
    const ids = snapshot.val() || []

    // fetch campaign details for each ID
    const campaigns = await Promise.all(ids.map(async (id) => {
      const campaignSnapshot = await db.ref(`campaigns/${id}`).once('value')
      if (campaignSnapshot.exists()) {
        return { id, ...campaignSnapshot.val() }
      }
      return null;
    }))

    // filter out null campaigns (in case some IDs do not exist)
    res.status(200).json(campaigns.filter(campaign => campaign !== null))
  } catch (err) {
    console.error('Failed to fetch favorites:', err)
    res.status(500).json({ error: 'Failed to get favorite campaigns' })
  }
})

// GET /favorite-campaign/:id
app.get('/favorite-campaign/:id', authenticate, async (req, res) => {
  const userId = req.user.uid
  const campaignId = req.params.id
  try {
    const snapshot = await db.ref(`favoriteCampaign/${userId}`).once('value')
    const list = snapshot.val() || []
    res.status(200).json({ favorited: list.includes(campaignId) })
  } catch (err) {
    console.error('Error checking favorite:', err)
    res.status(500).json({ error: 'Failed to check campaign' })
  }
})

// POST /favorite-campaign/:id
app.post('/favorite-campaign/:id', authenticate, async (req, res) => {
  const userId = req.user.uid
  const campaignId = req.params.id
  try {
    const ref = db.ref(`favoriteCampaign/${userId}`)
    const snapshot = await ref.once('value')
    const list = snapshot.val() || []
    if (!list.includes(campaignId)) {
      list.push(campaignId)
      await ref.set(list)
    }
    res.status(201).json({ success: true, favorites: list })
  } catch (err) {
    console.error('Error adding favorite:', err)
    res.status(500).json({ error: 'Failed to add campaign to favorites' })
  }
})

// DELETE /favorite-campaign/:id
app.delete('/favorite-campaign/:id', authenticate, async (req, res) => {
  const userId = req.user.uid
  const campaignId = req.params.id
  try {
    const ref = db.ref(`favoriteCampaign/${userId}`)
    const snapshot = await ref.once('value')
    let list = snapshot.val() || []
    list = list.filter(id => id != campaignId)
    await ref.set(list)
    res.status(200).json({ success: true, favorites: list })
  } catch (err) {
    console.error('Error removing favorite:', err)
    res.status(500).json({ error: 'Failed to remove campaign from favorites' })
  }
})

//// DONATION HISTORY ////
// GET /donation-history
app.get('/donation-history', authenticate, async (req, res) => {
  const userId = req.user.uid
  try {
    const snapshot = await db.ref(`donation-history/${userId}`).orderByChild('timestamp').once('value')
    const donations = snapshot.val() || {}
    const result = Object.values(donations)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error fetching donation history:', err)
    res.status(500).json({ error: 'Failed to fetch donation history' })
  }
})

//// COMMENTS ////
// GET /comments/:campaignId

app.get('/comments/:campaignId', async (req, res) => {
  const { campaignId } = req.params
  const userCache = {}

  try {
    const snapshot = await db.ref(`comments/${campaignId}`).orderByKey().once('value')
    const comments = snapshot.val() || {}

    const results = await Promise.all(
      Object.entries(comments).map(async ([commentId, data]) => {
        const userId = data.userId

        if (!userCache[userId]) {
          const userSnap = await db.ref(`users/${userId}`).once('value')
          const userInfo = userSnap.val()
          userCache[userId] = userInfo?.name || 'Unknown'
        }

        return {
          commentId,
          timestamp: data.timestamp,
          message: data.message,
          userId,
          name: userCache[userId]
        }
      })

    )

    res.status(200).json(results.reverse())
  } catch (err) {
    console.error('Error fetching comments with usernames:', err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// POST /comments/:campaignId
app.post('/comments/:campaignId', authenticate, async (req, res) => {
  const { campaignId } = req.params
  const { commentContent } = req.body

  if (!commentContent || typeof commentContent !== 'string') {
    return res.status(400).json({ error: 'Invalid comment content' })
  }

  // Get username from the authenticated user
  const userSnap = await db.ref(`users/${req.user.uid}`).once('value')
  const userInfo = userSnap.val()
  if (!userInfo || !userInfo.name) {
    return res.status(400).json({ error: 'User name not found in profile' })
  }
  const name = userInfo.name

  const timestamp = Date.now()
  const commentId = uuidv4() // Generate a unique ID for the comment
  const commentData = {
    userId: req.user.uid,
    message: commentContent,
    timestamp,
    name
  }

  try {
    await db.ref(`comments/${campaignId}/${commentId}`).set(commentData)
    res.status(201).json({ success: true, comment: commentData })
  } catch (err) {
    console.error('Error saving comment:', err)
    res.status(500).json({ error: 'Failed to save comment' })
  }
})

/// DONATIONS ///
// GET /campaigns/:id/donations
app.get('/campaigns/:id/donations', async (req, res) => {
  const { id } = req.params
  try {
    const snapshot = await db.ref(`donations/${id}`).orderByChild('timestamp').once('value')
    const donations = snapshot.val() || {}
    const result = Object.values(donations)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error fetching donations:', err)
    res.status(500).json({ error: 'Failed to fetch donations' })
  }
})

// GET /campaigns/:id/donators
app.get('/campaigns/:id/donators', async (req, res) => {
  const { id } = req.params
  try {
    const snapshot = await db.ref(`donations/${id}`).once('value')
    const campaignDonations = snapshot.val() || {}

    const donorMap = new Map()

    // Iterate through donations inside that campaign
    for (const donation of Object.values(campaignDonations)) {
      const { userId, name, amount } = donation
      if (!userId || !name || !amount) continue

      if (!donorMap.has(userId)) {
        donorMap.set(userId, { name, total: 0 })
      }
      donorMap.get(userId).total += amount
    }

    const result = Array.from(donorMap.entries())
      .map(([userId, info]) => ({ userId, ...info }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 100)

    res.status(200).json(result)
  } catch (err) {
    console.error('Error aggregating donators:', err)
    res.status(500).json({ error: 'Failed to aggregate donations' })
  }
})

// POST /update-donations
// SEPAY will call this when it received the money
app.post('/update-donations', async (req, res) => {
  const payload = req.body

  try {
    const content = payload?.content || ''

    const extractedContent = content.match(/FUNDME\s+([a-fA-F0-9]{32})/);
    const extractedId = extractedContent ? extractedContent[1] : null;
    console.log('Extracted ID:', extractedId)

    // Check if pending donation exists
    const pendingSnap = await db.ref(`pending-donations/${extractedId}`).once('value')
    const pendingData = pendingSnap.val()

    if (!pendingData) {
      return res.status(404).json({ error: 'Pending donation not found' })
    }

    const campaignId = pendingData.campaignId
    if (!campaignId) {
      return res.status(400).json({ error: 'Invalid campaign ID in pending donation' })
    }

    // If amount is mismatch?
    // Update new amount
    if (payload.transferAmount && !isNaN(payload.transferAmount)) {
      pendingData.amount = parseFloat(payload.transferAmount)
    }

    // Add to campaign donations
    await db.ref(`donations/${campaignId}/${extractedId}`).set({
      ...pendingData,
      confirmedAt: Date.now(),
      gateway: payload.gateway,
      accountNumber: payload.accountNumber,
      transactionDate: payload.transactionDate,
      referenceCode: payload.referenceCode,
    })

    await db.ref(`donation-history/${pendingData.userId}/${extractedId}`).set({
      ...pendingData,
      confirmedAt: Date.now(),
      gateway: payload.gateway,
      accountNumber: payload.accountNumber,
      transactionDate: payload.transactionDate,
      referenceCode: payload.referenceCode,
    })

    // Update campaign total amount
    const campaignSnap = await db.ref(`campaigns/${campaignId}`).once('value')
    const campaignData = campaignSnap.val()
    if (!campaignData) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    const newTotal = (campaignData.current || 0) + (pendingData.amount || 0)
    await db.ref(`campaigns/${campaignId}`).update({
      current: newTotal
    })

    // Remove from pending
    await db.ref(`pending-donations/${extractedId}`).remove()

    res.status(200).json({ success: true, message: 'Donation confirmed' })
  } catch (err) {
    console.error('Error processing SePay donation callback:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})


// POST /donations/:campaignId (add to pending-donations)
app.post('/donations/:campaignId', authenticate, async (req, res) => {
  const { campaignId } = req.params
  const { amount, message = '', isAnonymous = false } = req.body
  const userId = req.user.uid

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    const userSnap = await db.ref(`users/${userId}`).once('value')
    const user = userSnap.val()
    if (!user || !user.name) {
      return res.status(400).json({ error: 'User name not found in profile' })
    }

    const timestamp = Date.now()
    const pendingId = uuidv4().replace(/-/g, '')
    const pendingData = {
      userId,
      name: user.name,
      amount,
      message,
      isAnonymous,
      campaignId,
      timestamp
    }

    await db.ref(`pending-donations/${pendingId}`).set(pendingData)

    const bankAccount = 'ur bank account'
    const bankName = 'ur bank name'
    const des = `FUNDME ${pendingId}`

    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${amount}&des=${des}&template=`;
    res.status(201).json({ success: true, id: pendingId, ...pendingData, qrUrl })
  } catch (err) {
    console.error('Error creating pending donation:', err)
    res.status(500).json({ error: 'Failed to create pending donation' })
  }
})

exports.api = functions.https.onRequest(app)
