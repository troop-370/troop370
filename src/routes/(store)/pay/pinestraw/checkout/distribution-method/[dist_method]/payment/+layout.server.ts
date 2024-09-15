import type { LayoutServerLoad } from './$types';

export const load = (async ({ parent, params, route }) => {
  const {
    breadcrumbs,
    storeProfile,
    paypalPaymentMethodId,
    PAYPAL_PERCENT_FEE,
    venmoPaymentMethodId,
    VENMO_PERCENT_FEE,
  } = await parent();

  // get available payment methods
  const availablePaymentMethods =
    storeProfile?.payment?.paymentOptions
      ?.filter((option) => {
        if (option.enabled === false) return false;
        if (option.shippingSettings) {
          return option.shippingSettings.enabledShippingMethods.includes(params.dist_method);
        }
        return true;
      })
      .map((option) => {
        let name = option.checkoutTitle;
        if (option.paymentProcessorId === 'offline') {
          name += ' (manual)';
        }
        if (option.id === paypalPaymentMethodId) {
          name += ` (+${PAYPAL_PERCENT_FEE}% transaction fee)`;
        }
        if (option.id === venmoPaymentMethodId) {
          name += ` (+${VENMO_PERCENT_FEE}% transaction fee)`;
        }

        return {
          ...option,
          checkoutTitleLong: name,
        };
      }) ?? [];

  return {
    availablePaymentMethods,
    breadcrumbs: [
      ...breadcrumbs,
      {
        label: 'Payment',
        href: `/pay/pinestraw/checkout/distribution-method/${params.dist_method}/payment`,
      },
    ],
  };
}) satisfies LayoutServerLoad;
