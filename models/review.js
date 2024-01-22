const mongoose = require('mongoose')
const Tour = require('./tour')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name image',
  })
  // .populate({
  //   path: 'tour',
  //   select: 'name',
  // })

  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])

  const ratingsQuantity = stats[0]?.numRating ?? 0
  const ratingsAverage = stats[0]?.avgRating ?? 0

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity,
    ratingsAverage,
  })
}

reviewSchema.post('save', function () {
  // this points to current review doc
  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.post(/^findOneAnd/, async (doc) => {
  await doc.constructor.calcAverageRatings(doc.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
