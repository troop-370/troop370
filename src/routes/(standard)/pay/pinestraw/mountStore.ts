import { goto } from '$app/navigation';
import { injectInstructionValues } from './injectInstructionValues';
import { setCustomFields } from './setCustomFields';

export function mountStore(storeDivId: string, defaultCategoryId: string) {
  let ecwidLoaded = false;

  function load_ecwid() {
    if (typeof Ecwid != 'undefined') {
      Ecwid.OnAPILoaded.add(function () {
        if (!ecwidLoaded) {
          ecwidLoaded = true;
          xProductBrowser(
            'categoriesPerRow=3',
            'views=grid(3,3) list(10) table(20)',
            'categoryView=grid',
            'searchView=list',
            `id=${storeDivId}`,
            `defaultCategoryId=${defaultCategoryId}`
          );
        }
      });

      // Ecwid.OnPageLoaded.add(function (page) {
      //   console.log('loaded', page);
      // });

      // Ecwid.OnCartChanged.add(function (cart) {
      //   console.log(JSON.stringify(cart));
      // });

      // poll for existence of div with class ec-cart-step__section--description
      // whenever we are on the CHECKOUT_PAYMENT_DETAILS page
      injectInstructionValues();

      setCustomFields();
    }
  }

  window.ec = window.ec || {};
  window.ec.config = window.ec.config || {};
  window.ec.config.storefrontUrls = window.ec.config.storefrontUrls || {};
  window.ec.config.storefrontUrls.cleanUrls = false;
  window.ec.config.baseUrl = '/pay/pinestraw';
  window.ec.config.storefrontUrls.queryBasedCleanUrls = false;
  window.ec.order = window.ec.order || {};
  window.ec.order.extraFields = window.ec.order.extraFields || {};

  window.ecwid_script_defer = true;
  window.ecwid_dynamic_widgets = true;

  if (!document.getElementById('ecwid-script')) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://app.ecwid.com/script.js?18291121&data_platform=code&data_date=2022-11-29';
    script.id = 'ecwid-script';
    script.onload = load_ecwid;
    document.body.appendChild(script);
  } else {
    load_ecwid();
  }
}
