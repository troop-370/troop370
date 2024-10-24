<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import Button, { Icon, Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let subject = '';
  let senderName = '';
  let senderEmail = '';
  let replyEmail = '';
  let body = '';
  $: lists = data.contactListOptions.filter((opt) => opt.checked).map((opt) => opt.value);

  onMount(() => {
    subject = sessionStorage?.getItem('email.subject') || '';
    body = sessionStorage?.getItem('email.body') || '';
    senderName = sessionStorage?.getItem('email.senderName') || '';

    const maybeSenderEmail = sessionStorage?.getItem('email.senderEmail') || '';
    if (data.accountEmails.includes(maybeSenderEmail)) {
      senderEmail = maybeSenderEmail;
    }

    const maybeReplyEmail = sessionStorage?.getItem('email.replyEmail') || '';
    if (data.accountEmails.includes(maybeSenderEmail)) {
      replyEmail = maybeSenderEmail;
    }
  });

  let sendLoading = false;
  const sendEmail = () => {
    if (!subject) throw new Error('Subject is missing');
    if (!senderName) throw new Error('Sender name is missing');
    if (!senderEmail) throw new Error('Sender email is missing');
    if (!replyEmail) throw new Error('Reply email is missing');
    if (!body) throw new Error('Email HTML is missing');
    if (!lists) throw new Error('Contact lists are missing');

    sendLoading = true;

    const searchParams = new URLSearchParams(``);
    searchParams.set('subject', subject);
    searchParams.set('senderName', senderName);
    searchParams.set('senderEmail', senderEmail);
    searchParams.set('replyEmail', replyEmail);
    searchParams.set('body', body);
    searchParams.set('lists', lists.join(','));

    fetch('/email/secure/send', {
      method: 'POST',
      body: searchParams,
    })
      .then((res) => res.json())
      .then(({ data }) => {
        const redirect = JSON.parse(data)[0];
        sendLoading = false;
        window.location.href = redirect;
      });
  };
</script>

<h1>Send email</h1>

{#if browser}
  <div class="grid">
    <div class="form">
      <Textfield bind:value={subject} variant="outlined" label="Subject" type="text" required />
      <Textfield
        bind:value={senderName}
        variant="outlined"
        label="Sender name"
        type="text"
        required
      />
      <Select variant="outlined" bind:value={senderEmail} label="Sender email" required>
        {#each data.accountEmails as email}
          <Option value={email}>{email}</Option>
        {/each}
      </Select>
      <Select variant="outlined" bind:value={replyEmail} label="Reply email" required>
        {#each data.accountEmails as email}
          <Option value={email}>{email}</Option>
        {/each}
      </Select>
      <div class="lists">
        <span>Lists</span>
        {#each data.contactListOptions as option}
          <FormField>
            <Checkbox bind:checked={option.checked} />
            <span slot="label">{option.label}</span>
          </FormField>
        {/each}
      </div>
      <Textfield bind:value={body} variant="outlined" label="Email HTML" type="text" required />
      <Button on:click={sendEmail} variant="outlined">
        {#if sendLoading}
          <Icon class="material-icons">hourglass_top</Icon>
        {:else}
          <Icon class="material-icons">send</Icon>
        {/if}
        <Label>Send email</Label>
      </Button>
    </div>
    <iframe srcdoc={body} title="Email preview" frameborder="0" />
  </div>
{:else}
  <div style="padding: 35px 20px; font-family: var(--font-detail);">Please wait...</div>
{/if}

<style>
  h1 {
    font-family: var(--font-headline);
    max-width: 1600px;
    margin: 0 auto;
    padding: 35px 20px 0 20px;
  }

  div.grid {
    max-width: 1600px;
    margin: 0 auto;
    padding: 35px 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  div.lists {
    border: 1px solid var(--color-neutral-80);
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: 240px;
    overflow: auto;
  }
  div.lists > span {
    font-family: var(--font-detail);
    font-size: 13px;
    color: var(--color-neutral-140);
    margin: 8px 0 6px 6px;
  }

  div.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  iframe {
    border: 1px solid var(--color-neutral-80);
    width: 100%;
    height: 696px;
  }
</style>
