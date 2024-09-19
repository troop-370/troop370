<script>
  import Banner from '$components/Banner.svelte';
  import { title } from '$stores/title';
  import Button, { Icon, Label } from '@smui/button';
  import Textfield from '@smui/textfield';

  $: title.set('Contact Webmaster');
</script>

<Banner>
  <h1>Contact</h1>
  <p>
    Use the contact form below to get in contact with a representative from Troop 370. We do our
    best to respond quickly to any questions you may have. If you are having issues with the website
    or need the password, <a href="/contact-webmaster">contact a webmaster</a>.
  </p>
</Banner>

<form name="contact-general" method="POST" action="https://formspree.io/jackebuehner@gmail.com">
  <Textfield
    value=""
    variant="outlined"
    label="First name"
    input$name="First_Name"
    type="text"
    autocomplete="given-name"
    required
  />
  <Textfield
    value=""
    variant="outlined"
    label="Last name"
    input$name="Last_name"
    type="text"
    autocomplete="family-name"
    required
  />
  <Textfield
    value=""
    variant="outlined"
    label="Email"
    input$name="_replyto"
    type="email"
    autocomplete="email"
    required
  />
  <Textfield
    value=""
    variant="outlined"
    label="Phone"
    input$name="Phone"
    type="tel"
    autocomplete="tel"
  />
  <Textfield value="" variant="outlined" label="Subject" input$name="_subject" type="text" />
  <Textfield textarea value="" label="Message" input$name="message" input$rows={5} required />
  <Button type="submit" value="Submit" variant="outlined" name="action">
    <Icon class="material-icons">send</Icon>
    <Label>Submit</Label>
  </Button>
  <meta name="referrer" content="origin" />
  <input type="hidden" name="_next" value="submission-received" />
  <input type="hidden" name="_format" value="plain" />
  <input type="hidden" name="_cc" value="hgevans@bellsouth.net,iconherder@gmail.com" />
</form>

<style>
  form {
    width: 100%;
    max-width: 1200px;
    margin: 35px auto;
    padding: 0 20px;
    box-sizing: border-box;
  }

  form > :global(label) {
    width: 100%;
    margin: 0 0 10px 0;
  }
</style>
