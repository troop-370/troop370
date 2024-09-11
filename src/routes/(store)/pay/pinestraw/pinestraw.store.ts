import storage from '$lib/store';

interface PinestrawStore {
  quantity: number;
  deliveryOption?: { label: string; value: string };
  spreadingOption?: { label: string; value: string };
  paymentMethod?: { label: string; value: string };
  lastUpdated?: number;
}

export const pinestrawStore = storage<PinestrawStore>(
  'store:pinestraw',
  {
    quantity: 1,
  },
  'sessionStorage'
);
