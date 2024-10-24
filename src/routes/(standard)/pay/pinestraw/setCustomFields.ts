export const customFields = [
  {
    id: 'where_stack_pine_straw_bales',
    title: 'Where in your yard should we stack the pine straw bales?',
    type: 'textarea',
    required: true,
    available: true,
    showInInvoice: true,
    showInNotifications: true,
    checkoutDisplaySection: 'shipping_address',
    orderDetailsDisplaySection: 'shipping_info',
  },
  {
    id: 'where_spread_pine_straw',
    title: 'Where in your yard should we spread the pine straw?',
    type: 'textarea',
    required: true,
    available: true,
    showInInvoice: true,
    showInNotifications: true,
    checkoutDisplaySection: 'shipping_address',
    orderDetailsDisplaySection: 'shipping_info',
  },
  {
    id: 'special_instructions',
    title: 'Is there anything else we should know? (e.g., gate code) (optional)',
    type: 'textarea',
    required: false,
    available: true,
    showInInvoice: true,
    showInNotifications: true,
    checkoutDisplaySection: 'shipping_address',
    orderDetailsDisplaySection: 'shipping_info',
  },
];

export function setCustomFields() {
  Ecwid.OnCartChanged.add(function (cart) {
    const cartHasPineStrawBales = cart.items.some((item) => item.product.id === 696447273);
    const cartHasPineStrawSpreading = cart.items.some((item) => item.product.id === 696427357);

    if (cartHasPineStrawBales) {
      window.ec.order.extraFields.where_stack_pine_straw_bales = {
        ...customFields.find((field) => field.id === 'where_stack_pine_straw_bales'),
        title: `Where in your yard should we stack the pine straw bales${cartHasPineStrawSpreading ? ' prior to spreading' : ''}?`,
        tip: cartHasPineStrawSpreading
          ? 'If you order spreading service, we may still need to stack the bales before we can spread them.'
          : '',
      };
    } else {
      window.ec.order.extraFields.where_stack_pine_straw_bales = undefined;
    }

    if (cartHasPineStrawSpreading) {
      window.ec.order.extraFields.where_spread_pine_straw = customFields.find(
        (field) => field.id === 'where_spread_pine_straw'
      );
    } else {
      window.ec.order.extraFields.where_spread_pine_straw = undefined;
    }

    if (cartHasPineStrawBales || cartHasPineStrawSpreading) {
      window.ec.order.extraFields.special_instructions = customFields.find(
        (field) => field.id === 'special_instructions'
      );
    } else {
      window.ec.order.extraFields.special_instructions = undefined;
    }
  });

  // window.Ecwid && Ecwid.refreshConfig();
}
