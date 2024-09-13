<script lang="ts">
  import { browser } from '$app/environment';
  import { applyAction, enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  export let data;
  let email = data.session['store.pinestraw.checkout.email'] || '';
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
      <CardTitle style="font-size: 1.5rem; line-height: 2rem;" tag="h1">
        Let's create your order
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>
        To continue, enter your email address. This address will be used to send you order status
        updates.
      </p>

      <div class="input">
        <Label for="email">Email address</Label>
        <Input id="email" name="email" type="email" bind:value={email} />
      </div>
    </CardContent>
    <CardFooter style="display: flex; justify-content: space-between;">
      <Button type="submit" disabled={browser && !email}>Continue</Button>
    </CardFooter>
  </Card>
</form>
