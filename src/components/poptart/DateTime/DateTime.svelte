<script lang="ts">
  import { Button } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import Calendar from './Calendar.svelte';
  import Time from './Time.svelte';

  /**
   * Disables the field.
   */
  export let disabled = false;

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
        : `${zeroPad(year, 4)}-${zeroPad(month, 2)}-${zeroPad(day, 2)}T00:00:00.000`
      : undefined;

  export let datetime: Date | undefined = undefined;
  $: datetime = strDate ? new Date(strDate) : undefined;

  const dispatch = createEventDispatcher<{ change: string }>();
  $: if (datetime) dispatch('change', toIsoString(datetime, false));

  /**
   * Pads a number with leading zeros and returns it as a string.
   */
  function zeroPad(num: number, places: number) {
    return String(num).padStart(places, '0');
  }

  function toIsoString(date: Date, ignoreOffset = false) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function (num: number) {
        return (num < 10 ? '0' : '') + num;
      },
      padMs = function (num: number) {
        return (num < 10 ? '00' : num < 100 ? '0' : '') + num;
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
      '.' +
      padMs(date.getMilliseconds()) +
      (ignoreOffset
        ? 'Z'
        : dif + pad(Math.floor(Math.abs(tzo) / 60)) + ':' + pad(Math.abs(tzo) % 60))
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
            {datetime.getHours() % 12 || 12}
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
          time = `${zeroPad(evt.detail.hour, 2)}:${zeroPad(evt.detail.minute, 2)}:${zeroPad(datetime?.getSeconds() || 0, 2)}.${zeroPad(datetime?.getMilliseconds() || 0, 3)}`;
        }}
      />
    </div>
    <Button
      disabled={disabled || !datetime}
      on:click={() => {
        if (disabled) return;
        const now = new Date();
        const nowTime = toIsoString(now, true).split('T')[1].slice(0, -1);
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
