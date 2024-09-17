<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { CardTitle } from '$lib/components/ui/card';
  import type { PageData } from './$types';

  export let data: PageData;

  function resultMessage(str: string) {
    const resultMessageElement = document.getElementById('result-message');
    if (resultMessageElement) {
      resultMessageElement.innerHTML = str;
    }
  }

  function handlePayPalScriptLoad() {
    window.paypal
      .Buttons({
        style: {
          shape: 'rect',
          layout: 'vertical',
          color: 'black',
        },

        async createOrder() {
          try {
            const response = await fetch('/api/paypal/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              // use the "body" param to optionally pass additional order information
              // like product ids and quantities
              body: JSON.stringify({
                storePlainOrderId: data.plainOrderId,
              }),
            });

            const orderData = await response.json();

            if (orderData.id) {
              return orderData.id;
            }
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
              ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
              : JSON.stringify(orderData);

            throw new Error(errorMessage);
          } catch (error) {
            console.error(error);
            resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
          }
        },

        async onApprove(data, actions) {
          try {
            const response = await fetch(`/api/paypal/orders/${data.orderID}/capture`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const orderData = await response.json();
            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you message

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
              // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              // recoverable state, per
              // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
              return actions.restart();
            } else if (errorDetail) {
              // (2) Other non-recoverable errors -> Show a failure message
              throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else if (!orderData.purchase_units) {
              throw new Error(JSON.stringify(orderData));
            } else {
              // (3) Successful transaction -> Show confirmation or thank you message
              // Or go to another URL:  actions.redirect('thank_you.html');
              console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
              goto(`/pay/pinestraw/thank-you?method=paypal`);
            }
          } catch (error) {
            console.error(error);
            resultMessage(`Sorry, your transaction could not be processed...<br><br>${error}`);
          }
        },
      })
      .render('#paypal-button-container');
  }
</script>

{#if browser}
  <!-- Initialize the PayPal JS-SDK -->
  <script
    src="https://www.paypal.com/sdk/js?client-id=AXAixfvs5tF9WHo6IFgULpj6yFhBaPeWZS2W3x5XUFJ6eWa4dvCVnWC9-1lfhmIPAPOHvrGG6Oo5R77d&buyer-country=US&currency=USD&components=buttons&disable-funding=paylater,credit,card"
    data-sdk-integration-source="developer-studio"
    on:load={handlePayPalScriptLoad}
  ></script>
{/if}

<section>
  <CardTitle tag="h2" style="margin-bottom: 0.5rem;">Pay</CardTitle>

  <p>Your order will be submitted once payment is received via PayPal.</p>

  <div id="paypal-button-container"></div>

  <p id="result-message"></p>
</section>
