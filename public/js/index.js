import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { login, signup } from './auth'
import { renderMap } from './mapbox'

// RENDER MAP
const mapContainer = document.querySelector('#map')

if (mapContainer) {
  const { locations } = mapContainer.dataset
  renderMap(JSON.parse(locations))
}

// LOGIN SUBMIT EVENT LISTENER
const loginForm = document.querySelector('#login-form')

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    login({ email, password })
  })
}

// SIGNUP SUBMIT EVENT LISTENER
const signupForm = document.querySelector('#signup-form')

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
