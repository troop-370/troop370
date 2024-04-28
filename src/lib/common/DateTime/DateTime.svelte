<script lang="ts">
  import type { YStore } from '$utils/y/createYStore';
  import { Button, TextBox } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import type { YTextEvent } from 'yjs';
  import Calendar from './Calendar.svelte';
  import Time from './Time.svelte';

  /**
   * Disables the field.
   */
  export let disabled = false;

  /**
   * A yjs document that should be updated with the values of this field.
   */
  export let ydoc: YStore['ydoc'] | undefined = undefined;
  export let ydocKey: string = '';

  // this will be updated by a subscription to ydoc, which is why this is not marked reactive
  let yText = $ydoc?.getText(ydocKey);

  export let hideTime = false;

  export let month: number | undefined = undefined;
  export let day: number | undefined = undefined;
  export let year: number | undefined = undefined;
  export let time: string | undefined = undefined;

  export let strDate: string | undefined = undefined;
  $: strDate =
    year && month && day
      ? time
        ? `${zeroPad(year, 4)}-${zeroPad(month, 2)}-${zeroPad(day, 2)}T${time}`
        : `${zeroPad(year, 4)}-${zeroPad(month, 2)}-${zeroPad(day, 2)}`
      : undefined;

  export let datetime: Date | undefined = undefined;
  $: datetime = strDate ? new Date(strDate) : undefined;
  $: updateSharedTypeValue(datetime);

  const dispatch = createEventDispatcher<{ change: string }>();

  // listen for changes in the shared type
  ydoc?.subscribe(
    ($ydoc) => {
      yText = $ydoc?.getText(ydocKey);
      if (!yText) return;

      // ensure the svelte component value matches the shared type value
      const date = new Date(yText.toJSON());
      if (!isNaN(date.getFullYear()) && datetime?.toISOString() !== date.toISOString()) {
        month = date.getMonth() + 1;
        day = date.getDate();
        year = date.getFullYear();
        time = toIsoString(date).split('T')[1];
      }

      yText.observe(handleYTextChange);
    },
    () => {
      // stop listening for changes in the array shared type
      // during cleanup to prevent memory leaks
      yText?.unobserve(handleYTextChange);
    }
  );

  /**
   * Updates the date string value in the yjs shared type for this date field.
   */
  function updateSharedTypeValue(datetime: Date | undefined) {
    if (datetime && !isNaN(datetime.getFullYear()) && $ydoc && yText) {
      $ydoc.transact(() => {
        yText?.delete(0, yText.toJSON().length);
        yText?.insert(0, datetime?.toISOString() || '');
      });
    }
  }

  /**
   * Update the date variables values in the svelte component in
   * response to an update event from the yjs shared type
   */
  function handleYTextChange(evt: YTextEvent) {
    const text = evt.target.toJSON();
    const date = new Date(text);

    if (text && !isNaN(date.getFullYear())) {
      month = date.getMonth() + 1;
      day = date.getDate();
      year = date.getFullYear();
      time = toIsoString(date).split('T')[1];
    }

    // send changes to parent
    dispatch('change', toIsoString(date));
  }

  /**
   * Pads a number with leading zeros and returns it as a string.
   */
  function zeroPad(num: number, places: number) {
    return String(num).padStart(places, '0');
  }

  function toIsoString(date: Date) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function (num: number) {
        return (num < 10 ? '0' : '') + num;
      };

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' +
      pad(Math.abs(tzo) % 60)
    );
  }

  let width: number = 800;

  let dateFieldWidth: number;
  let dateFieldOpen = false;
  $: if (disabled) dateFieldOpen = false;

  let timeFieldWidth: number;
  let timeFieldOpen = false;
  $: if (disabled) timeFieldOpen = false;
</script>

<div class="datetime-field" bind:clientWidth={width} class:narrow={width < 500}>
  <div>
    <div bind:clientWidth={dateFieldWidth}>
      <Button
        class="date-field {dateFieldWidth < 360 ? 'widerYear' : ''}"
        style="padding-left: 0; padding-right: 0;"
        on:click={() => (dateFieldOpen = !dateFieldOpen)}
        {disabled}
      >
        <div class="date-field--month">
          {#if datetime && !isNaN(datetime.getMonth())}
            {new Intl.DateTimeFormat('en-us', { month: 'long' }).format(datetime)}
          {:else}
            month
          {/if}
        </div>
        <div class="date-field--day">
          {#if datetime && !isNaN(datetime.getDate())}
            {day}
          {:else}
            day
          {/if}
        </div>
        <div class="date-field--year">
          {#if datetime && !isNaN(datetime.getFullYear())}
            {year}
          {:else}
            year
          {/if}
        </div>
      </Button>
    </div>
    <Calendar
      width={dateFieldWidth}
      bind:open={dateFieldOpen}
      initialMonth={datetime ? datetime.getMonth() + 1 : undefined}
      initialDay={datetime?.getDate()}
      initialYear={datetime?.getFullYear()}
      on:select={(evt) => {
        if (disabled) return;
        month = evt.detail.month;
        day = evt.detail.day;
        year = evt.detail.year;
      }}
    />
  </div>
  <Button
    {disabled}
    on:click={() => {
      month = new Date().getMonth() + 1;
      day = new Date().getDate();
      year = new Date().getFullYear();
    }}
  >
    Today
  </Button>
  {#if !hideTime}
    <div bind:clientWidth={timeFieldWidth}>
      <Button
        class="time-field"
        style="padding-left: 0; padding-right: 0;"
        on:click={() => (timeFieldOpen = !timeFieldOpen)}
        disabled={disabled || !datetime}
      >
        <div class="time-field--hour">
          {#if datetime && !isNaN(datetime.getFullYear())}
            {datetime.getHours() % 12}
          {:else}
            hour
          {/if}
        </div>
        <div class="time-field--minute">
          {#if datetime && !isNaN(datetime.getFullYear())}
            {datetime.getMinutes()}
          {:else}
            minute
          {/if}
        </div>
        <div class="time-field--am">
          {#if datetime && !isNaN(datetime.getFullYear())}
            {datetime.getHours() >= 12 ? 'PM' : 'AM'}
          {:else}
            AM
          {/if}
        </div>
      </Button>
      <Time
        width={timeFieldWidth}
        bind:open={timeFieldOpen}
        initialHour={datetime ? datetime.getHours() % 12 : undefined}
        initialMinute={datetime?.getMinutes()}
        initialAm={datetime ? (datetime.getHours() >= 12 ? 'PM' : 'AM') : undefined}
        on:select={(evt) => {
          if (disabled) return;
          const timeOffset = toIsoString(new Date()).slice(19);
          time = `${zeroPad(evt.detail.hour, 2)}:${zeroPad(evt.detail.minute, 2)}:00${timeOffset}`;
        }}
      />
    </div>
    <Button
      disabled={disabled || !datetime}
      on:click={() => {
        const now = new Date();
        const nowTime = (time = toIsoString(now).split('T')[1]);
        time = nowTime;
      }}
    >
      Now
    </Button>
  {/if}
</div>

<style>
  .datetime-field {
    display: grid;
    grid-template-columns: 1fr 59px 0.7fr 51px;
    gap: 6px;
    /* overflow: hidden; */
  }

  .datetime-field.narrow {
    grid-template-columns: 1fr 59px;
    grid-auto-rows: auto;
  }

  :global(.date-field) {
    width: 100%;
    display: grid !important;
    grid-template-columns: 2fr 1fr 1fr;
  }
  :global(.date-field.widerYear) {
    grid-template-columns: 1.8fr 1fr 1.2fr;
  }

  :global(.time-field) {
    width: 100%;
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .date-field--month {
    text-align: start;
  }

  .date-field--month,
  .date-field--day,
  .date-field--year,
  .time-field--hour,
  .time-field--minute,
  .time-field--am {
    position: relative;
    padding-left: 11px;
    padding-right: 11px;
  }

  .date-field--day::before,
  .date-field--year::before,
  .time-field--minute::before,
  .time-field--am::before {
    content: '';
    position: absolute;
    top: -3px;
    right: 0px;
    bottom: -5px;
    left: 0px;
    box-shadow: inset 1px 0 0 0 var(--fds-control-stroke-default);
  }
</style>
