import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { renderMap } from './mapbox'
import { login, logout, signup } from './auth'
import { updateMyGeneralData, updateMyPassword } from './users'

// DOM ELEMENTS
const mapContainer = document.querySelector('#map')
const loginForm = document.querySelector('#login-form')
const signupForm = document.querySelector('#signup-form')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

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

    const name = document.querySelector('#name').value
    const email = document.querySelector('#email').value

    updateMyGeneralData({ name, email })
  })
}

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
