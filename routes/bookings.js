const express = require('express')

const { protect, restrictTo } = require('../controllers/auth')
const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/booking')
const getRecursiveRoles = require('../utils/get-recursive-roles')
const { USER_ROLES } = require('../constants/user')

const router = express.Router({ mergeParams: true })

router.use(protect)

router.get('/checkout-session/:tourId', getCheckoutSession)

router.use(restrictTo(getRecursiveRoles(USER_ROLES.LEAD_GUIDE)))

router.route('/').get(getAllBookings).post(createBooking)

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking)

module.exports = router
