import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { login, logout, signup } from './auth'
import { renderMap } from './mapbox'

// DOM ELEMENTS
const mapContainer = document.querySelector('#map')
const loginForm = document.querySelector('#login-form')
const signupForm = document.querySelector('#signup-form')
const logoutBtn = document.querySelector('.nav__el--logout')

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
