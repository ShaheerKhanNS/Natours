import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51MKjE0SEz6qpVj6pM4YC7EYaWeXbymFIIesmnG9zI5oiwGPpaRTAcXLIxeOysVwrOWi6z7lJNvJPTiNL7JCVN4qX00pUzOpjVC'
);
export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API

    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    console.log(session);

    // 2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
