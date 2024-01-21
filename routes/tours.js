const express = require('express')

const { USER_ROLES } = require('../constants/user')

const { protect, restrictTo } = require('../controllers/auth')
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tour')
const reviewsRouter = require('./reviews')

const router = express.Router()

// RELATED TO REVIEWS
router.use('/:tourId/reviews', reviewsRouter)

router.route('/top-rating').get(aliasTopTours, getAllTours)
router.route('/stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect, getMonthlyPlan)

router.route('/').get(getAllTours).post(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.LEAD_GUIDE), createTour)
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.LEAD_GUIDE, USER_ROLES.TECHNICIAN), updateTour)
  .delete(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.LEAD_GUIDE, USER_ROLES.TECHNICIAN), deleteTour)

module.exports = router
