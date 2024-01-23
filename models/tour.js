const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const { isAlphanumeric } = validator

const DIFFICULTIES = ['easy', 'medium', 'difficult']

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name specified'],
      unique: true,
      trim: true,
      maxlength: [50, 'Maximum tour name length is 50 characters'],
      minlength: [10, 'Minimum tour name length is 10 characters'],
      validate: {
        validator: function (val) {
          return isAlphanumeric(val.replace(/ /g, ''))
        },
        message: 'Name should only contain alphanumeric characters',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration specified'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty specified'],
      enum: {
        values: DIFFICULTIES,
        message: `Difficulty is either: ${DIFFICULTIES.join(', ')}`,
      },
      trim: true,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size specified'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price specified'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: async function (value) {
          // this keyword only Points to current doc on NEW document creation
          // return value < this.price
          // So to adress this problem, we add `context: 'query'` option in edition tour query
          // then we use async to get doc from query (this)
          const doc = await this
          const originalPrice = doc.price || doc[0].price
          return value < originalPrice
        },
        message: 'Discount price ({VALUE}) should be less than original price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      // Referencing
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// INDEXES (Use Indexes for high read/write ratio to improve query performance)
tourSchema.index({ price: 1, ratingsAverage: -1 }) // Compound Index
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

// VIRTUAL PROPERTIES DEFINITION
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// for embedding users to schema
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)

//   next()
// })

// tourSchema.pre('save', (next) => {
//   console.log('Will save document...')
//   next()
// })

// tourSchema.post('save', (doc, next) => {
//   console.log(doc)
//   next()
// })

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.start = Date.now()
  this.find({ secretTour: { $ne: true } })
  next()
})

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })

  next()
})

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Tours query took ${Date.now() - this.start} ms`)
  next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  next()
})

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
