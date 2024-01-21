const express = require('express')

const { USER_ROLES } = require('../constants/user')

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

router.route('/').get(getAllReviews).post(restrictTo(USER_ROLES.USER), setUserAndTourIds, createReview)

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), updateReview)
  .delete(restrictTo(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), deleteReview)

module.exports = router
