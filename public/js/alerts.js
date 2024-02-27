const HIDE_ALERT_AFTER = 6000

export const hideAlert = () => {
  const el = document.querySelector('.alert')
  if (el) {
    el.parentElement.removeChild(el)
  }
}

/**
 * Renders alert and closes existing alert
 * @param {('success'|'error')} type Type of the alert
 * @param {string} message Text of the alert
 * @returns {string[]} Array with added parent roles
 */
export const showAlert = (type, message) => {
  hideAlert()

  const markup = `<div class='alert alert--${type}'>${message}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)

  setTimeout(hideAlert, HIDE_ALERT_AFTER)
}
