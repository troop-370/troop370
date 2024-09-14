<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

  const showPayByCheckReminder = $page.url.searchParams.get('payment_method') === 'check';
</script>

<Card>
  <CardHeader>
    <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">Order completed</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Thank you for your order! You will receive an email confirmation shortly.</p>

    {#if showPayByCheckReminder}
      <p>
        Don't forget to mail your check!
        <strong>
          <i>Your order will not be processed until the check has been received and deposited.</i>
        </strong>
      </p>
    {/if}
  </CardContent>
  <CardFooter style="display: flex; justify-content: space-between;">
    <Button href="/pay/pinestraw">Return to Pine Straw Store</Button>
  </CardFooter>
</Card>
