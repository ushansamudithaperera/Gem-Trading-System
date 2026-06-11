import api from './api';

export interface CreatePaymentIntentPayload {
  amount: number;
  orderId?: string;
  jobId?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amountLKR: number;
  currency: string;
}

export interface ConfirmPaymentPayload {
  orderId?: string;
  jobId?: string;
  paymentIntentId: string;
}

/**
 * Calls POST /api/v1/payments/create-intent
 * Returns the Stripe clientSecret + paymentIntentId.
 */
export const createPaymentIntent = async (
  payload: CreatePaymentIntentPayload
): Promise<CreatePaymentIntentResponse> => {
  const response = await api.post('/payments/create-intent', payload);
  return response.data.data as CreatePaymentIntentResponse;
};

/**
 * Calls PATCH /api/v1/payments/confirm
 * Updates Order/Job status and moves funds to escrow.
 * Must be called AFTER stripe.confirmPayment() succeeds client-side.
 */
export const confirmPayment = async (
  payload: ConfirmPaymentPayload
): Promise<void> => {
  await api.patch('/payments/confirm', payload);
};
