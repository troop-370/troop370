<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

  export let data;

  const orderId = 'PS-' + data.session['store.pinestraw.checkout.orderId'];
  const amount = data.orderDetails.total;

  // see https://blog.alexbeals.com/posts/venmo-deeplinking for more info
  $: venmoLink = `https://account.venmo.com/pay?audience=private&amount=${amount}&note=${orderId}&recipients=%2CTroop-ThreeSeventy&txn=pay`;
  $: venmoLinkMobile = venmoLink.replace('https://account.venmo.com/pay', 'venmo://paycharge');

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

  let venmoLinkClicked = false;
  let interval: number;
  function handleVenmoLink(evt: MouseEvent) {
    evt.preventDefault();

    const isMobile = detectMobile();

    if (isMobile) {
      window.open(venmoLinkMobile, '_blank');
      venmoLinkClicked = true;
    } else {
      const win = window.open(venmoLink, '_blank', 'width=500,height=800');
      if (win) {
        interval = setInterval(() => {
          if (!win) {
            venmoLinkClicked = true;
          }
          if (win.closed) {
            venmoLinkClicked = true;
          }
        }, 1000);
      } else {
        venmoLinkClicked = true;
      }
    }
  }

  $: if (venmoLinkClicked) {
    clearInterval(interval);
  }
</script>

<form
  method="POST"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === 'redirect') {
        goto(result.location);
      } else {
        await applyAction(result);
      }
    };
  }}
>
  <Card>
    <CardHeader>
      <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Pay with Venmo</CardTitle>
    </CardHeader>
    <CardContent>
      <p>
        For the Venmo payment method, you will need to send payment to
        <code>@Troop-ThreeSeventy</code> via the Venmo button below. You must have a Venmo account
        to use this payment method.
        <strong>
          <i>
            Your order will not be processed until Venmo payment has been received and confirmed.
          </i>
        </strong>
      </p>

      <!-- Hey there! If you are changing these instructions, don't forget to also change
       the instructions in the Ecwid control panel. The instructions there are included
       in the receipt in case a customer ignores these instructions or accidenally
       clicks Submit order -->

      <ol>
        <li>Read these instructions.</li>
        <li>Click or tap the <b>Pay with Venmo</b> button to open a pre-filled Venmo payment.</li>
        <li>
          Confirm that the payment is to <code>@Troop-ThreeSeventy</code> for
          <code>${amount.toFixed(2)}</code>
          and only contains
          <code>{orderId}</code> in the note.
        </li>
        <li>If you see a blue <b>Pay</b> button, tap it.</li>
        <li class="highlight">
          Enable the <strong>Turn on for purchases</strong> option. The switch should have a
          <img
            style="display: inline;"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALfSURBVDhPfVNNSFRRFL73/c1MlpZalqOJTqOSQe7KiimiVuFCalMQQpISQX8WoVGOlLYIrTBcGELSIquFRVBBG42wMgMhRZ3RKVMbnci/caaZ9+5P5z5n+nHRB++9e757zjvfuedcjJbBcfVcAWWsjHHu4hwVCA5jNCBh/FqWpNbRy40DpmMMv3+wv6VB8XwbryWcVXLOLTH6H2CMowqWGnLTM2telVcSkxOv4vvN8ief57FOaYmw46CIm1/5Tx4TFll5mp+RdehF2RkiCyK61XnFYPSEWIsQAtqniYFCjM2HOIsEKbFqkowUqEWAcpY/E1xg853vurDz2nnnT0Pvg5pXiO1JIxpFshKqzNk8derAQQq1o+aXT7Q7I/0pQUNfZVctFpEE+LBN1Qpxdu3Zuigl1YL0E4O8OVwxVLgpLyHBaksGKgkegcWIrn//MNQ/52pv2bJB1VSRDEqpl0B6kfBgQjxnxJGemQrB2UDFg1Gfz7tSJ0a2MyNrHfjQpZNBSMRKGOGNwjAPihh4MRwKCLvHM4hmF4Poee9b1NHbjVRFRaFIOIAowZJwAIhYWHMas4GRLJBN2DRq6Kj0XhPyBfyouuQIsmka6/UMQoz0V4s5lRP3bCsGSQ5hEjjpL1MT+tGi3TM569OTXY585CooRBZVRRFD91Y8bF09y3miNdYNmIuPEkxXl2kBkiUJdS/MZDV2PAhDV/z2lLVIUxREGJ2se9QW7QnO2deATxwiVk7bt2ucMHYMVJjSkmQFdUz40ia9w/6c1LSx6dkfgar2VkvTSH9uhmaNjZbZxgWbop40tUArq6CV9eYOwJwHCpOqR3VztDSrZocfx4MFoIXVn2tuXl8qBrDRfboFlByPmf+FIkl3v7pvl4u1OcoC853vn6Xs3alzxLeLnIKLZ4xnAdkhVVbcY+5bF2PUslsCyKu74DAoKYWLtUPG2Ck4yrlXk+VuCG4bvnRj1HQ0gdAvSmo1IDtjQ0UAAAAASUVORK5CYII="
            alt=""
          /> green shield when enabled. Per the Venmo User Agreement, we are required to have this option
          enabled.
        </li>
        <li>
          Confirm your screen looks similar to this one:
          <br />
          <div class="img-parent">
            <img
              src="https://troop370atlanta.org/screenshots/venmo-pinestraw-final-result.png"
              alt=""
              width="374"
              height="595"
              style="border: 1px solid #ccc;"
            />
          </div>
          Your amount, order number, and payment method will be different. Everything else should look
          the same.
        </li>
        <li>Tap <strong>Pay</strong>.</li>
        <li class="highlight">
          Once you complete the payment, return to this page and click or tap the
          <b>Submit order</b>
          button.
        </li>
      </ol>

      <Button class="checkout--pay-with-venmo" on:click={handleVenmoLink}>
        <span> Pay with </span>
        <img
          class="logo-venmo"
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTAxIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IldoaXRlIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPGcgaWQ9IkxvZ28iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE2LjY2NjA0ODQsMC4xOCBDMTcuMzQ2NjYyNiwxLjMzOTA5OTEgMTcuNjUzNTA2OSwyLjUzMjk3Mjk3IDE3LjY1MzUwNjksNC4wNDEwODEwOCBDMTcuNjUzNTA2OSw4Ljg1MTE3MTE3IDEzLjY3MTM0NiwxNS4wOTk4MTk4IDEwLjQzOTM0NiwxOS40ODc1Njc2IEwzLjA1NzI1OTUyLDE5LjQ4NzU2NzYgTDAuMDk2NjMxNDg3OSwxLjIzMzE1MzE1IEw2LjU2MDQ1Njc1LDAuNjAwMzYwMzYgTDguMTI1NzgyMDEsMTMuNTg5NTQ5NSBDOS41ODgzNTk4NiwxMS4xMzI2MTI2IDExLjM5MzI1NDMsNy4yNzE1MzE1MyAxMS4zOTMyNTQzLDQuNjM5MDk5MSBDMTEuMzkzMjU0MywzLjE5ODE5ODIgMTEuMTUzODU5OSwyLjIxNjc1Njc2IDEwLjc3OTc0MDUsMS40MDg2NDg2NSBMMTYuNjY2MDQ4NCwwLjE4IFogTTI0LjkwNzE1OTIsMTEuNjkzODczOSBDMjQuOTA3MTU5MiwxMy44MzY3NTY4IDI2LjA2MjcxOCwxNC42Nzc0Nzc1IDI3LjU5NDY2NzgsMTQuNjc3NDc3NSBDMjkuMjYyOTE1MiwxNC42Nzc0Nzc1IDMwLjg2MDIxOCwxNC4yNTcxMTcxIDMyLjkzNjMwOTcsMTMuMTY5MTg5MiBMMzIuMTU0MzQ2LDE4LjY0NDUwNDUgQzMwLjY5MTU5MzQsMTkuMzgxNDQxNCAyOC40MTE5MjkxLDE5Ljg3MzE1MzIgMjYuMTk5MTkwMywxOS44NzMxNTMyIEMyMC41ODYzNTEyLDE5Ljg3MzE1MzIgMTguNTc3NTM0NiwxNi4zNjMyNDMyIDE4LjU3NzUzNDYsMTEuOTc1MzE1MyBDMTguNTc3NTM0Niw2LjI4ODEwODExIDIxLjg0NTE4MTcsMC4yNDkzNjkzNjkgMjguNTgxOTUxNiwwLjI0OTM2OTM2OSBDMzIuMjkwOTkzMSwwLjI0OTM2OTM2OSAzNC4zNjQ5ODc5LDIuMzkyMDcyMDcgMzQuMzY0OTg3OSw1LjM3NTY3NTY4IEMzNC4zNjUzMzc0LDEwLjE4NTU4NTYgMjguMzc4Mzc4OSwxMS42NTkwOTkxIDI0LjkwNzE1OTIsMTEuNjkzODczOSBaIE0yNS4wNDM0NTY3LDguMjE4MTk4MiBDMjYuMjMyOTE1Miw4LjIxODE5ODIgMjkuMjI3NDQyOSw3LjY1NzExNzEyIDI5LjIyNzQ0MjksNS45MDIxNjIxNiBDMjkuMjI3NDQyOSw1LjA1OTQ1OTQ2IDI4LjY0OTU3NjEsNC42MzkwOTkxIDI3Ljk2ODYxMjUsNC42MzkwOTkxIEMyNi43NzcyMzE4LDQuNjM5MDk5MSAyNS4yMTM4Mjg3LDYuMTEyMjUyMjUgMjUuMDQzNDU2Nyw4LjIxODE5ODIgWiBNNTMuMDE4NzA5Myw0LjQ2MzYwMzYgQzUzLjAxODcwOTMsNS4xNjU1ODU1OSA1Mi45MTU0Mzc3LDYuMTgzNzgzNzggNTIuODEyNjkwMyw2Ljg0OTE4OTE5IEw1MC44NzMwNzA5LDE5LjQ4NzM4NzQgTDQ0LjU3OTA5MzQsMTkuNDg3Mzg3NCBMNDYuMzQ4MzQwOCw3LjkwMjE2MjE2IEM0Ni4zODE4OTEsNy41ODc5Mjc5MyA0Ni40ODQ5ODc5LDYuOTU1MzE1MzIgNDYuNDg0OTg3OSw2LjYwNDMyNDMyIEM0Ni40ODQ5ODc5LDUuNzYxNjIxNjIgNDUuOTc0Mzk2Miw1LjU1MTM1MTM1IDQ1LjM2MDUzMjksNS41NTEzNTEzNSBDNDQuNTQ1MTkzOCw1LjU1MTM1MTM1IDQzLjcyNzkzMjUsNS45MzcxMTcxMiA0My4xODM2MTU5LDYuMjE4NzM4NzQgTDQxLjE3Njg5NjIsMTkuNDg3NTY3NiBMMzQuODQ3NDQ2NCwxOS40ODc1Njc2IEwzNy43MzkwNTE5LDAuNTY1OTQ1OTQ2IEw0My4yMTcxNjYxLDAuNTY1OTQ1OTQ2IEw0My4yODY1MzgxLDIuMDc2MjE2MjIgQzQ0LjU3ODkxODcsMS4xOTg3Mzg3NCA0Ni4yODA3MTYzLDAuMjQ5NzI5NzMgNDguNjk1MjgwMywwLjI0OTcyOTczIEM1MS44OTQyNTQzLDAuMjQ5MzY5MzY5IDUzLjAxODcwOTMsMS45MzQ5NTQ5NSA1My4wMTg3MDkzLDQuNDYzNjAzNiBaIE03MS43MDM3MDkzLDIuMzIwNzIwNzIgQzczLjUwNjMzMjIsMC45ODgxMDgxMDggNzUuMjA4NDc5MiwwLjI0OTM2OTM2OSA3Ny41NTU0MTg3LDAuMjQ5MzY5MzY5IEM4MC43ODcyNDM5LDAuMjQ5MzY5MzY5IDgxLjkxMTM0OTUsMS45MzQ5NTQ5NSA4MS45MTEzNDk1LDQuNDYzNjAzNiBDODEuOTExMzQ5NSw1LjE2NTU4NTU5IDgxLjgwODQyNzMsNi4xODM3ODM3OCA4MS43MDU2Nzk5LDYuODQ5MTg5MTkgTDc5Ljc2ODMzMjIsMTkuNDg3Mzg3NCBMNzMuNDcyNjA3MywxOS40ODczODc0IEw3NS4yNzU1Nzk2LDcuNjU3Mjk3MyBDNzUuMzA4NzgwMyw3LjM0MTA4MTA4IDc1LjM3ODUwMTcsNi45NTUzMTUzMiA3NS4zNzg1MDE3LDYuNzEwNjMwNjMgQzc1LjM3ODUwMTcsNS43NjE4MDE4IDc0Ljg2NzczNTMsNS41NTEzNTEzNSA3NC4yNTQwNDY3LDUuNTUxMzUxMzUgQzczLjQ3MjI1NzgsNS41NTEzNTEzNSA3Mi42OTA4MTgzLDUuOTAyMzQyMzQgNzIuMTEwNjc5OSw2LjIxODczODc0IEw3MC4xMDQzMDk3LDE5LjQ4NzU2NzYgTDYzLjgxMDE1NzQsMTkuNDg3NTY3NiBMNjUuNjEzMTI5OCw3LjY1NzQ3NzQ4IEM2NS42NDYzMzA0LDcuMzQxMjYxMjYgNjUuNzEzOTU1LDYuOTU1NDk1NSA2NS43MTM5NTUsNi43MTA4MTA4MSBDNjUuNzEzOTU1LDUuNzYxOTgxOTggNjUuMjAzMDEzOCw1LjU1MTUzMTUzIDY0LjU5MTQyMjEsNS41NTE1MzE1MyBDNjMuNzc0MzM1Niw1LjU1MTUzMTUzIDYyLjk1ODgyMTgsNS45MzcyOTczIDYyLjQxNDUwNTIsNi4yMTg5MTg5MiBMNjAuNDA2MjEyOCwxOS40ODc3NDc3IEw1NC4wNzg4NTk5LDE5LjQ4Nzc0NzcgTDU2Ljk3MDExNTksMC41NjYxMjYxMjYgTDYyLjM4MTMwNDUsMC41NjYxMjYxMjYgTDYyLjU1MTMyNywyLjE0NTc2NTc3IEM2My44MTAxNTc0LDEuMTk5MDk5MSA2NS41MTA1NTcxLDAuMjUwMDkwMDkgNjcuNzkwMDQ2NywwLjI1MDA5MDA5IEM2OS43NjM3NDA1LDAuMjQ5MzY5MzY5IDcxLjA1NTk0NjQsMS4xMjcwMjcwMyA3MS43MDM3MDkzLDIuMzIwNzIwNzIgWiBNODMuNTUwNTksMTEuNzk5ODE5OCBDODMuNTUwNTksNS44MzI3OTI3OSA4Ni42MTIwNDMzLDAuMjQ5MzY5MzY5IDkzLjY1NTgzMjIsMC4yNDkzNjkzNjkgQzk4Ljk2MzM5OTcsMC4yNDkzNjkzNjkgMTAwLjkwMzU0MywzLjQ3OTgxOTgyIDEwMC45MDM1NDMsNy45Mzg3Mzg3NCBDMTAwLjkwMzU0MywxMy44MzY1NzY2IDk3Ljg3NTExNTksMTkuOTQ0MzI0MyA5MC42NjE0NzkyLDE5Ljk0NDMyNDMgQzg1LjMxOTY2MjYsMTkuOTQ0MzI0MyA4My41NTA1OSwxNi4zMjgxMDgxIDgzLjU1MDU5LDExLjc5OTgxOTggWiBNOTQuNDM3NDQ2NCw3LjgzMjc5Mjc5IEM5NC40Mzc0NDY0LDYuMjg4MTA4MTEgOTQuMDYyODAyOCw1LjIzNDk1NDk1IDkyLjk0MDk2ODksNS4yMzQ5NTQ5NSBDOTAuNDU3MDMyOSw1LjIzNDk1NDk1IDg5Ljk0Njk2NTQsOS43NjMwNjMwNiA4OS45NDY5NjU0LDEyLjA3OTQ1OTUgQzg5Ljk0Njk2NTQsMTMuODM2NzU2OCA5MC40MjM4MzIyLDE0LjkyNDMyNDMgOTEuNTQ1MzE2NiwxNC45MjQzMjQzIEM5My44OTMxMjk4LDE0LjkyNDMyNDMgOTQuNDM3NDQ2NCwxMC4xNDkwMDkgOTQuNDM3NDQ2NCw3LjgzMjc5Mjc5IFoiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg"
          alt=""
          aria-label="venmo"
        />
      </Button>
    </CardContent>
    <CardFooter style="display: flex; justify-content: space-between;">
      <Button type="submit" disabled={venmoLinkClicked !== true}>Submit order</Button>
    </CardFooter>
  </Card>
</form>

<style>
  code {
    background-color: hsla(0, 0%, 0%, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius);
  }

  ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }

  :global(.checkout--pay-with-venmo) {
    background-color: rgb(0, 156, 222) !important;
    flex-direction: column !important;
    align-items: start !important;
    height: 3.75rem !important;
  }

  img.logo-venmo {
    height: 1.4rem;
    margin-bottom: 0.1rem;
  }

  li.highlight {
    background-color: rgba(255, 183, 0, 0.139);
    border-width: 1px;
    border-color: rgba(255, 183, 0, 0.591);
    padding: 0.25rem;
    border-radius: var(--radius);
  }

  .img-parent {
    width: calc(100% - 2rem);
  }

  .img-parent img {
    display: block;
    max-width: 350px;
    height: auto;
    width: 100%;
  }
</style>
