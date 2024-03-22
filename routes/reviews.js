const express = require('express')

const { USER_ROLES } = require('../constants/user')
const getRecursiveRoles = require('../utils/get-recursive-roles')

const { protect, restrictTo } = require('../controllers/auth')

const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setUserAndTourIds,
  getReview,
} = require('../controllers/review')

const router = express.Router({ mergeParams: true })

// PROTECTED ROUTES
router.use(protect)

// POST /reviews
// or POST /tours/:tourId/reviews (because we added nested routes in toursRouter)

router.route('/').get(getAllReviews).post(setUserAndTourIds, createReview)

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), updateReview)
  .delete(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), deleteReview)

module.exports = router
