const express = require('express')

const { USER_ROLES } = require('../constants/user')
const getRecursiveRoles = require('../utils/get-recursive-roles')

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
  getToursWithin,
} = require('../controllers/tour')
const reviewsRouter = require('./reviews')

const router = express.Router()

// ROUTE RELATED TO REVIEWS
router.use('/:tourId/reviews', reviewsRouter)

router.route('/top-rating').get(aliasTopTours, getAllTours)
router.route('/stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect, getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(protect, getToursWithin)

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo(getRecursiveRoles(USER_ROLES.LEAD_GUIDE)), createTour)
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo(getRecursiveRoles(USER_ROLES.LEAD_GUIDE)), updateTour)
  .delete(protect, restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), deleteTour)

module.exports = router
