const express = require('express')
const { getOverview, getTour, getLoginForm } = require('../controllers/view')
const { isLoggedIn } = require('../controllers/auth')

const router = express.Router()

router.use(isLoggedIn)

router.get('/', getOverview)
router.get('/tour/:slug', getTour)
router.get('/login', getLoginForm)

module.exports = router
