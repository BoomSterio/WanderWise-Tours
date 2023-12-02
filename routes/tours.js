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

const router = express.Router()

router.route('/top-rating').get(aliasTopTours, getAllTours)
router.route('/stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route('/').get(protect, getAllTours).post(createTour)
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.LEAD_GUIDE, USER_ROLES.TECHNICIAN), deleteTour)

module.exports = router
