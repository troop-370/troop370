<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
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
      <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Pay with check</CardTitle>
    </CardHeader>
    <CardContent>
      <p>
        For the check payment method, you will need to mail a check to the address below.
        <strong>
          <i> Your order will not be processed until the check has been received and deposited. </i>
        </strong>
        Please make sure to include the order number on the check memo line.
      </p>

      <ol>
        <li>Write a check for <code>$0.00</code> payable to <code>Troop 370</code>.</li>
        <li>For the memo, specify <code>ORDER-000</code></li>
        <li>
          Mail the check to:
          <address>
            Troop 370 Fundraiser<br />
            270 Beachland Dr<br />
            Sandy Springs, GA 30342
          </address>
        </li>
      </ol>

      <p>
        You will receive an email confirmation with your check has been deposited and funds have
        been received.
      </p>
    </CardContent>
    <CardFooter style="display: flex; justify-content: space-between;">
      <Button type="submit">Submit order</Button>
    </CardFooter>
  </Card>
</form>

<style>
  code {
    background-color: hsla(0, 0%, 0%, 0.1);
    padding: 0.1rem 0.3rem;
    border-radius: var(--radius);
  }

  address {
    padding-left: 1.5rem;
  }

  ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
  }
</style>
