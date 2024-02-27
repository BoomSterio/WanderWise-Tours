import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login } from './login'
import { renderMap } from './mapbox'

// RENDER MAP
const mapContainer = document.querySelector('#map')

if (mapContainer) {
  const { locations } = mapContainer.dataset
  renderMap(JSON.parse(locations))
}

// LOGIN SUBMIT EVENT LISTENER
const loginForm = document.querySelector('.form')

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    login(email, password)
  })
}
