const Tour = require('../models/tour')
const catchAsync = require('../utils/catch-async')

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find()

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  })
})

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  })
}
