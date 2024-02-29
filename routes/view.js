const express = require('express')
const { getOverview, getTour, getLoginForm, getSignupForm } = require('../controllers/view')
const { isLoggedIn } = require('../controllers/auth')

const router = express.Router()

router.use(isLoggedIn)

router.get('/', getOverview)
router.get('/tour/:slug', getTour)
router.get('/login', getLoginForm)
router.get('/signup', getSignupForm)

module.exports = router
