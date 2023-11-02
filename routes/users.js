const express = require('express')

const { getAllUsers, createUser, getUser, updateUser, deleteUser } = require('../controllers/user')
const { signup, login, forgotPassword, resetPassword } = require('../controllers/auth')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)

router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:id', resetPassword)

router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = router
