import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { renderMap } from './mapbox'
import { login, logout, signup } from './auth'
import { updateMyGeneralData, updateMyPassword } from './users'
import { bookTour } from './stripe'

// DOM ELEMENTS
const mapContainer = document.querySelector('#map')
const loginForm = document.querySelector('#login-form')
const signupForm = document.querySelector('#signup-form')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const userImageInput = document.querySelector('.form-user-data .form__upload')
const bookTourBtn = document.querySelector('#book-tour')

// RENDER MAP
if (mapContainer) {
  const { locations } = mapContainer.dataset
  renderMap(JSON.parse(locations))
}

// LOGIN SUBMIT EVENT LISTENER
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    login({ email, password })
  })
}

// SIGNUP SUBMIT EVENT LISTENER
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const name = document.querySelector('#name').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const passwordConfirm = document.querySelector('#passwordConfirm').value

    signup({ name, email, password, passwordConfirm })
  })
}

// HANDLING LOG OUT
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout)
}

// HANDLING CURRENT USER DATA FORM SUBMIT
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const form = new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('image', document.getElementById('image').files[0])

    updateMyGeneralData(form)
  })
}

// HANDLING CURRENT USER PASSWORD UPDATE
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const passwordCurrent = document.querySelector('#password-current').value
    const password = document.querySelector('#password').value
    const passwordConfirm = document.querySelector('#password-confirm').value

    const updatePasswordBtn = document.querySelector('.btn--save-password')
    const updatePasswordBtnText = updatePasswordBtn.innerHTML

    updatePasswordBtn.innerHTML = 'Loading...'
    await updateMyPassword({ passwordCurrent, password, passwordConfirm })
    updatePasswordBtn.innerHTML = updatePasswordBtnText
  })
}

// PREVIEWING SELECTED USER IMAGE
if (userImageInput) {
  userImageInput.addEventListener('change', function () {
    const img = document.querySelector('.form-user-data .form__user-photo')
    const { 0: file, length } = this.files

    if (length < 1) {
      return
    }

    img.src = URL.createObjectURL(file)

    img.onload = function () {
      URL.revokeObjectURL(this.src)
    }
  })
}

// TOUR BOOKING
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...'
    e.target.disabled = true
    const { tourId } = e.target.dataset
    bookTour(tourId)
  })
}
