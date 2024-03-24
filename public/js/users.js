import axios from 'axios'

import { showAlert } from './alerts'

export const updateMyGeneralData = async (values) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/update-me`,
      data: values,
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Profile updated!')
      window.setTimeout(() => {
        window.location.reload(true)
      }, 500)
    }
  } catch (err) {
    showAlert('error', `Could not update profile: ${err.response.data.message}`)
  }
}

export const updateMyPassword = async ({ passwordCurrent, password, passwordConfirm }) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/update-my-password`,
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Password updated successfully!')
      window.setTimeout(() => {
        window.location.reload(true)
      }, 500)
    }
  } catch (err) {
    showAlert('error', `Could not update password: ${err.response.data.message}`)
  }
}
