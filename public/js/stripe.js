/* eslint-disable no-undef */
import axios from 'axios'

import { showAlert } from './alerts'

const stripe = Stripe(
  'pk_test_51OwqklCPf7BAtHGEGfQuvznxYOAosNfDgtyqjUh1hYOj9nu7izdW9anl8cP3yoroSvTwcNCVau9FSFviXkyaWdKr002NWlDPGj',
)

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const {
      data: { session },
    } = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

    await stripe.redirectToCheckout({
      sessionId: session.id,
    })
  } catch (err) {
    showAlert('error', `Could not book tour: ${err.response.data.message}`)
  }
  // 2) Display checkout form and charge credit card information}
}
