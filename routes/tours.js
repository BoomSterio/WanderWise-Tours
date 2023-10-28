const express = require('express')

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

router.route('/').get(getAllTours).post(createTour)
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = router
