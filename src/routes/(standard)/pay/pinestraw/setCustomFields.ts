export function setCustomFields() {
  Ecwid.OnCartChanged.add(function (cart) {
    const cartHasPineStrawBales = cart.items.some((item) => item.product.id === 696447273);
    const cartHasPineStrawSpreading = cart.items.some((item) => item.product.id === 696427357);

    if (cartHasPineStrawBales) {
      window.ec.order.extraFields.where_stack_pine_straw_bales = {
        title: `Where in your yard should we stack the pine straw bales${cartHasPineStrawSpreading ? ' prior to spreading' : ''}?`,
        textPlaceholder: '',
        type: 'textarea',
        tip: cartHasPineStrawSpreading
          ? 'If you order spreading service, we may still need to stack the bales before we can spread them.'
          : '',
        required: true,
        available: true,
        showInInvoice: true,
        showInNotifications: true,
        checkoutDisplaySection: 'shipping_address',
        orderDetailsDisplaySection: 'shipping_info',
      };
    } else {
      window.ec.order.extraFields.where_stack_pine_straw_bales = undefined;
    }

    if (cartHasPineStrawSpreading) {
      window.ec.order.extraFields.where_spread_pine_straw = {
        title: 'Where in your yard should we spread the pine straw?',
        textPlaceholder: '',
        type: 'textarea',
        tip: '',
        required: true,
        available: true,
        showInInvoice: true,
        showInNotifications: true,
        checkoutDisplaySection: 'shipping_address',
        orderDetailsDisplaySection: 'shipping_info',
      };
    } else {
      window.ec.order.extraFields.where_spread_pine_straw = undefined;
    }

    if (cartHasPineStrawBales || cartHasPineStrawSpreading) {
      window.ec.order.extraFields.special_instructions = {
        title: 'Is there anything else we should know? (e.g., gate code) (optional)',
        textPlaceholder: '',
        type: 'textarea',
        tip: '',
        required: false,
        available: true,
        showInInvoice: true,
        showInNotifications: true,
        checkoutDisplaySection: 'shipping_address',
        orderDetailsDisplaySection: 'shipping_info',
      };
    } else {
      window.ec.order.extraFields.special_instructions = undefined;
    }
  });

  // window.Ecwid && Ecwid.refreshConfig();
}
