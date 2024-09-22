import { PUBLIC_ECWID_STORE_ID } from '$env/static/public';

/**
 * This script is used to inject the instruction text into the payment details page.
 *
 * It polls for the existence of the description element and replaces the text with the instruction text.
 * It stops polling when the page changes.
 */
export function injectInstructionValues() {
  const handleOnPageLoaded = async (page) => {
    let intervalId: number | null = null;

    if (page.type === 'CHECKOUT_PAYMENT_DETAILS' || page.type === 'ORDER_CONFIRMATION') {
      const { cart, total } = await new Promise((resolve, reject) => {
        try {
          if (page.type === 'CHECKOUT_PAYMENT_DETAILS') {
            Ecwid.Cart.calculateTotal((order) => {
              resolve(order);
            });
          }
          if (page.type === 'ORDER_CONFIRMATION') {
            const orderJSON = localStorage.getItem(
              `PSorder__result__${PUBLIC_ECWID_STORE_ID}PSorderResult`
            );
            const order = JSON.parse(orderJSON || '{}');
            const total = order?.confirmation?.order?.total;

            resolve({
              cart: { id: page.vendorOrderNumber },
              total: total || 999999999.99,
            });
          }
        } catch (error) {
          reject(error);
        }
      });

      intervalId = setInterval(() => {
        const description = getDescriptionElement(page.type);
        const needsReplacing = description && getDescriptionNeedsReplacing(description);
        if (needsReplacing) {
          replaceDescriptionTextVariables(description, cart, total);
          // if (description.innerText.includes('Venmo')) {
          //   injectVenmoPaymentLink(description, cart, total);
          // }
        }
      }, 100);

      // hi
    } else if (intervalId) {
      clearInterval(intervalId);
    }
  };

  Ecwid.OnPageLoaded.add(handleOnPageLoaded);
}

function getDescriptionElement(mode: 'CHECKOUT_PAYMENT_DETAILS' | 'ORDER_CONFIRMATION') {
  if (mode === 'CHECKOUT_PAYMENT_DETAILS') {
    return document.querySelector(
      '.ec-cart-step__section--description > div > div'
    ) as HTMLElement | null;
  }

  if (mode === 'ORDER_CONFIRMATION') {
    return document.querySelector(
      '.ec-confirmation__section--description > div'
    ) as HTMLElement | null;
  }
}

function replaceDescriptionTextVariables(element: HTMLElement, cart: any, total: number) {
  const orderId = cart.id as string | undefined;

  const text = element.innerHTML;
  element.innerHTML = text
    .replaceAll('${order.total}', `$${total?.toFixed(2) || '0.00'}`)
    .replaceAll('<@orderLink/>', orderId || '0')
    .replaceAll('&lt;@orderLink/&gt;', orderId || '0');

  const style = document.createElement('style');
  style.innerHTML += `
    [data-instruction-replaced] > *:not(:last-child) {
      margin-bottom: 0.5rem !important;
    }
    [data-instruction-replaced] > *:not(:first-child) {
      margin-top: 0.5rem !important;
    }

    [data-instruction-replaced] img {
      display: inline !important;
    }

    [data-instruction-replaced] ol,
    [data-instruction-replaced] ul {
      padding-left: 1.5rem !important;
      margin-top: 0.5rem !important;
      margin-bottom: 0.5rem !important;
    }

    [data-instruction-replaced] code {
      background-color: hsla(0, 0%, 0%, 0.1) !important;
      padding: 0.1rem 0.3rem !important;
      border-radius: var(--radius) !important;
    }

    [data-instruction-replaced] li.highlight {
      background-color: rgba(255, 183, 0, 0.139) !important;;
      border-width: 1px !important;
      border-color: rgba(255, 183, 0, 0.591) !important;;
      padding: 0.25rem !important;
      border-radius: var(--radius) !important;;
    }

    [data-instruction-replaced] address {
      padding-left: 1.5rem !important;
    }

    [data-instruction-replaced] img {
      height: auto !important;
      max-width: 300px !important;
      border: 1px solid #e0e0e0 !important;
    }
  `;
  element.appendChild(style);

  element.setAttribute('data-instruction-replaced', 'true');
}

function injectVenmoPaymentLink(element: HTMLElement, cart: any, total: number) {
  const orderId = cart.id as string | undefined;
  const venmoLink = `https://account.venmo.com/pay?audience=private&amount=${total}&note=${orderId}&recipients=%2CTroop-ThreeSeventy&txn=pay`;
  const venmoLinkMobile = venmoLink.replace('https://account.venmo.com/pay', 'venmo://paycharge');

  let venmoLinkUsed = false;
  let interval: number;
  function handleVenmoLink(evt: MouseEvent) {
    evt.preventDefault();

    const isMobile = detectMobile();

    if (isMobile) {
      window.open(venmoLinkMobile, '_blank');
      venmoLinkUsed = true;
      clearInterval(interval);
    } else {
      const win = window.open(venmoLink, '_blank', 'width=500,height=800');
      if (win) {
        interval = setInterval(() => {
          if (!win) {
            venmoLinkUsed = true;
            clearInterval(interval);
          }
          if (win.closed) {
            venmoLinkUsed = true;
            clearInterval(interval);
          }
        }, 1000);
      } else {
        venmoLinkUsed = true;
        clearInterval(interval);
      }
    }
  }

  const venmoPaymentButterContainer = document.createElement('div');
  venmoPaymentButterContainer.classList.add('ec-form__cell', 'ec-form__cell--6');

  const venmoPaymentButton = document.createElement('button');
  venmoPaymentButton.classList.add('checkout--pay-with-venmo', 'form-control__button');
  venmoPaymentButton.onclick = handleVenmoLink;
  venmoPaymentButterContainer.appendChild(venmoPaymentButton);

  const venmoPaymentButtonSpan = document.createElement('span');
  venmoPaymentButtonSpan.innerText = 'Pay with ';
  venmoPaymentButton.appendChild(venmoPaymentButtonSpan);

  const venmoPaymentButtonImage = document.createElement('img');
  venmoPaymentButtonImage.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTAxIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IldoaXRlIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPGcgaWQ9IkxvZ28iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2LjY2NjA0ODQsMC4xOCBDMTcuMzQ2NjYyNiwxLjMzOTA5OTEgMTcuNjUzNTA2OSwyLjUzMjk3Mjk3IDE3LjY1MzUwNjksNC4wNDEwODEwOCBDMTcuNjUzNTA2OSw4Ljg1MTE3MTE3IDEzLjY3MTM0NiwxNS4wOTk4MTk4IDEwLjQzOTM0NiwxOS40ODc1Njc2IEwzLjA1NzI1OTUyLDE5LjQ4NzU2NzYgTDAuMDk2NjMxNDg3OSwxLjIzMzE1MzE1IEw2LjU2MDQ1Njc1LDAuNjAwMzYwMzYgTDguMTI1NzgyMDEsMTMuNTg5NTQ5NSBDOS41ODgzNTk4NiwxMS4xMzI2MTI2IDExLjM5MzI1NDMsNy4yNzE1MzE1MyAxMS4zOTMyNTQzLDQuNjM5MDk5MSBDMTEuMzkzMjU0MywzLjE5ODE5ODIgMTEuMTUzODU5OSwyLjIxNjc1Njc2IDEwLjc3OTc0MDUsMS40MDg2NDg2NSBMMTYuNjY2MDQ4NCwwLjE4IFogTTI0LjkwNzE1OTIsMTEuNjkzODczOSBDMjQuOTA3MTU5MiwxMy44MzY3NTY4IDI2LjA2MjcxOCwxNC42Nzc0Nzc1IDI3LjU5NDY2NzgsMTQuNjc3NDc3NSBDMjkuMjYyOTE1MiwxNC42Nzc0Nzc1IDMwLjg2MDIxOCwxNC4yNTcxMTcxIDMyLjkzNjMwOTcsMTMuMTY5MTg5MiBMMzIuMTU0MzQ2LDE4LjY0NDUwNDUgQzMwLjY5MTU5MzQsMTkuMzgxNDQxNCAyOC40MTE5MjkxLDE5Ljg3MzE1MzIgMjYuMTk5MTkwMywxOS44NzMxNTMyIEMyMC41ODYzNTEyLDE5Ljg3MzE1MzIgMTguNTc3NTM0NiwxNi4zNjMyNDMyIDE4LjU3NzUzNDYsMTEuOTc1MzE1MyBDMTguNTc3NTM0Niw2LjI4ODEwODExIDIxLjg0NTE4MTcsMC4yNDkzNjkzNjkgMjguNTgxOTUxNiwwLjI0OTM2OTM2OSBDMzIuMjkwOTkzMSwwLjI0OTM2OTM2OSAzNC4zNjQ5ODc5LDIuMzkyMDcyMDcgMzQuMzY0OTg3OSw1LjM3NTY3NTY4IEMzNC4zNjUzMzc0LDEwLjE4NTU4NTYgMjguMzc4Mzc4OSwxMS42NTkwOTkxIDI0LjkwNzE1OTIsMTEuNjkzODczOSBaIE0yNS4wNDM0NTY3LDguMjE4MTk4MiBDMjYuMjMyOTE1Miw4LjIxODE5ODIgMjkuMjI3NDQyOSw3LjY1NzExNzEyIDI5LjIyNzQ0MjksNS45MDIxNjIxNiBDMjkuMjI3NDQyOSw1LjA1OTQ1OTQ2IDI4LjY0OTU3NjEsNC42MzkwOTkxIDI3Ljk2ODYxMjUsNC42MzkwOTkxIEMyNi43NzcyMzE4LDQuNjM5MDk5MSAyNS4yMTM4Mjg3LDYuMTEyMjUyMjUgMjUuMDQzNDU2Nyw4LjIxODE5ODIgWiBNNTMuMDE4NzA5Myw0LjQ2MzYwMzYgQzUzLjAxODcwOTMsNS4xNjU1ODU1OSA1Mi45MTU0Mzc3LDYuMTgzNzgzNzggNTIuODEyNjkwMyw2Ljg0OTE4OTE5IEw1MC44NzMwNzA5LDE5LjQ4NzM4NzQgTDQ0LjU3OTA5MzQsMTkuNDg3Mzg3NCBMNDYuMzQ4MzQwOCw3LjkwMjE2MjE2IEM0Ni4zODE4OTEsNy41ODc5Mjc5MyA0Ni40ODQ5ODc5LDYuOTU1MzE1MzIgNDYuNDg0OTg3OSw2LjYwNDMyNDMyIEM0Ni40ODQ5ODc5LDUuNzYxNjIxNjIgNDUuOTc0Mzk2Miw1LjU1MTM1MTM1IDQ1LjM2MDUzMjksNS41NTEzNTEzNSBDNDQuNTQ1MTkzOCw1LjU1MTM1MTM1IDQzLjcyNzkzMjUsNS45MzcxMTcxMiA0My4xODM2MTU5LDYuMjE4NzM4NzQgTDQxLjE3Njg5NjIsMTkuNDg3NTY3NiBMMzQuODQ3NDQ2NCwxOS40ODc1Njc2IEwzNy43MzkwNTE5LDAuNTY1OTQ1OTQ2IEw0My4yMTcxNjYxLDAuNTY1OTQ1OTQ2IEw0My4yODY1MzgxLDIuMDc2MjE2MjIgQzQ0LjU3ODkxODcsMS4xOTg3Mzg3NCA0Ni4yODA3MTYzLDAuMjQ5NzI5NzMgNDguNjk1MjgwMywwLjI0OTcyOTczIEM1MS44OTQyNTQzLDAuMjQ5MzY5MzY5IDUzLjAxODcwOTMsMS45MzQ5NTQ5NSA1My4wMTg3MDkzLDQuNDYzNjAzNiBaIE03MS43MDM3MDkzLDIuMzIwNzIwNzIgQzczLjUwNjMzMjIsMC45ODgxMDgxMDggNzUuMjA4NDc5MiwwLjI0OTM2OTM2OSA3Ny41NTU0MTg3LDAuMjQ5MzY5MzY5IEM4MC43ODcyNDM5LDAuMjQ5MzY5MzY5IDgxLjkxMTM0OTUsMS45MzQ5NTQ5NSA4MS45MTEzNDk1LDQuNDYzNjAzNiBDODEuOTExMzQ5NSw1LjE2NTU4NTU5IDgxLjgwODQyNzMsNi4xODM3ODM3OCA4MS43MDU2Nzk5LDYuODQ5MTg5MTkgTDc5Ljc2ODMzMjIsMTkuNDg3Mzg3NCBMNzMuNDcyNjA3MywxOS40ODczODc0IEw3NS4yNzU1Nzk2LDcuNjU3Mjk3MyBDNzUuMzA4NzgwMyw3LjM0MTA4MTA4IDc1LjM3ODUwMTcsNi45NTUzMTUzMiA3NS4zNzg1MDE3LDYuNzEwNjMwNjMgQzc1LjM3ODUwMTcsNS43NjE4MDE4IDc0Ljg2NzczNTMsNS41NTEzNTEzNSA3NC4yNTQwNDY3LDUuNTUxMzUxMzUgQzczLjQ3MjI1NzgsNS41NTEzNTEzNSA3Mi42OTA4MTgzLDUuOTAyMzQyMzQgNzIuMTEwNjc5OSw2LjIxODczODc0IEw3MC4xMDQzMDk3LDE5LjQ4NzU2NzYgTDYzLjgxMDE1NzQsMTkuNDg3NTY3NiBMNjUuNjEzMTI5OCw3LjY1NzQ3NzQ4IEM2NS42NDYzMzA0LDcuMzQxMjYxMjYgNjUuNzEzOTU1LDYuOTU1NDk1NSA2NS43MTM5NTUsNi43MTA4MTA4MSBDNjUuNzEzOTU1LDUuNzYxOTgxOTggNjUuMjAzMDEzOCw1LjU1MTUzMTUzIDY0LjU5MTQyMjEsNS41NTE1MzE1MyBDNjMuNzc0MzM1Niw1LjU1MTUzMTUzIDYyLjk1ODgyMTgsNS45MzcyOTczIDYyLjQxNDUwNTIsNi4yMTg5MTg5MiBMNjAuNDA2MjEyOCwxOS40ODc3NDc3IEw1NC4wNzg4NTk5LDE5LjQ4Nzc0NzcgTDU2Ljk3MDExNTksMC41NjYxMjYxMjYgTDYyLjM4MTMwNDUsMC41NjYxMjYxMjYgTDYyLjU1MTMyNywyLjE0NTc2NTc3IEM2My44MTAxNTc0LDEuMTk5MDk5MSA2NS41MTA1NTcxLDAuMjUwMDkwMDkgNjcuNzkwMDQ2NywwLjI1MDA5MDA5IEM2OS43NjM3NDA1LDAuMjQ5MzY5MzY5IDcxLjA1NTk0NjQsMS4xMjcwMjcwMyA3MS43MDM3MDkzLDIuMzIwNzIwNzIgWiBNODMuNTUwNTksMTEuNzk5ODE5OCBDODMuNTUwNTksNS44MzI3OTI3OSA4Ni42MTIwNDMzLDAuMjQ5MzY5MzY5IDkzLjY1NTgzMjIsMC4yNDkzNjkzNjkgQzk4Ljk2MzM5OTcsMC4yNDkzNjkzNjkgMTAwLjkwMzU0MywzLjQ3OTgxOTgyIDEwMC45MDM1NDMsNy45Mzg3Mzg3NCBDMTAwLjkwMzU0MywxMy44MzY1NzY2IDk3Ljg3NTExNTksMTkuOTQ0MzI0MyA5MC42NjE0NzkyLDE5Ljk0NDMyNDMgQzg1LjMxOTY2MjYsMTkuOTQ0MzI0MyA4My41NTA1OSwxNi4zMjgxMDgxIDgzLjU1MDU5LDExLjc5OTgxOTggWiBNOTQuNDM3NDQ2NCw3LjgzMjc5Mjc5IEM5NC40Mzc0NDY0LDYuMjg4MTA4MTEgOTQuMDYyODAyOCw1LjIzNDk1NDk1IDkyLjk0MDk2ODksNS4yMzQ5NTQ5NSBDOTAuNDU3MDMyOSw1LjIzNDk1NDk1IDg5Ljk0Njk2NTQsOS43NjMwNjMwNiA4OS45NDY5NjU0LDEyLjA3OTQ1OTUgQzg5Ljk0Njk2NTQsMTMuODM2NzU2OCA5MC40MjM4MzIyLDE0LjkyNDMyNDMgOTEuNTQ1MzE2NiwxNC45MjQzMjQzIEM5My44OTMxMjk4LDE0LjkyNDMyNDMgOTQuNDM3NDQ2NCwxMC4xNDkwMDkgOTQuNDM3NDQ2NCw3LjgzMjc5Mjc5IFoiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg';
  venmoPaymentButtonImage.alt = 'Venmo';
  venmoPaymentButtonImage.height = 24;
  venmoPaymentButtonImage.ariaLabel = 'nenmo';
  venmoPaymentButtonImage.classList.add('logo-venmo');
  venmoPaymentButton.appendChild(venmoPaymentButtonImage);

  const style = document.createElement('style');
  style.innerHTML = `
  .checkout--pay-with-venmo {
    appearance: none !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    padding: 0.5rem 1rem !important;
    color: white !important;
    gap: 0.25rem !important;
    background-color: rgb(0, 156, 222) !important;
    min-height: 36px !important;
    border-radius: var(--radius) !important;
  }

  .logo-venmo {
    height: 24px !important;
  }
  `;
  venmoPaymentButterContainer.appendChild(style);

  if (element) {
    element.appendChild(venmoPaymentButterContainer);
  }
}

function detectMobile() {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
    //@ts-expect-error
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

function getDescriptionNeedsReplacing(element: HTMLElement) {
  if (element.getAttribute('data-instruction-replaced') !== 'true') {
    return true;
  }

  return false;
}