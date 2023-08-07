<script lang="ts">
  import { goto } from '$app/navigation';
  import Banner from '$components/Banner.svelte';
  import { capitalize, formatISODate } from '$utils';
  import { RRule } from 'rrule';
  import type { PageData } from './$types';

  export let data: PageData;

  const recurringEvents = data.calendar.items.map((item) => {
    return {
      ...item,
      rr:
        !!item.recurrence && item.recurrence.length > 0
          ? RRule.fromString(item.recurrence[0])
          : undefined,
    };
  });
</script>

<Banner>
  <h1>Upcoming Events</h1>
  <p>
    <i>Last Updated {formatISODate(data.calendar.updated, false, true, true)}</i>
  </p>
</Banner>

<div id="main-content">
  <h2>Recurring events</h2>
  <p>The next occurance is listed for each recurring event.</p>

  <div class="table-wrapper-inner">
    <table>
      <thead>
        <tr>
          <th align="left">Event</th>
          <th align="left">Repeats</th>
          <th align="left">Start</th>
          <th align="left">End</th>
        </tr>
      </thead>
      <tbody>
        {#each recurringEvents.filter((event) => {
          if (!event.rr) return false; //  no rule
          if (!event.start) return false; // no start time for these events
          if (!event.rr.after) return false; // no more recurring times for this event
          if (!event.start.dateTime && !event.start.date) return false; // no start date or time for these events

          //** @type {Date} */
          let start;
          if (event.start.dateTime) {
            start = event.rr.after(new Date(event.start.dateTime));
          } else if (event.start.date) {
            start = event.rr.after(new Date(event.start.date));
          }
          if (!start) return false; // there is no found upcoming date, so remove the event from the list
          return true;
        }) as event}
          <tr on:click={() => goto(`/events/calendar/primary/event/${event.id}`)}>
            <td>
              <a href="/events/calendar/primary/event/{event.id}">{event.summary}</a>
            </td>
            <td>
              {capitalize(event.rr?.toText() || '')}
            </td>
            <td>
              {#if event.start?.dateTime && event.rr}
                {@const eventStartDate = event.rr.after(new Date(event.start.dateTime))}
                {#if eventStartDate}
                  {formatISODate(eventStartDate.toISOString())}
                  {@const time = formatISODate(
                    event.start?.dateTime,
                    false,
                    false,
                    true,
                    false,
                    false
                  )}
                  {#if time}
                    at {time}
                  {/if}
                {/if}
              {:else if event.start?.date && event.rr}
                {@const eventStartDate = event.rr.after(new Date(event.start.date))}
                {#if eventStartDate}
                  {formatISODate(eventStartDate.toISOString())}
                {/if}
              {/if}
            </td>
            <td>
              {#if event.end?.dateTime && event.rr}
                {@const eventDate = event.rr.after(new Date(event.end.dateTime))}
                {#if eventDate}
                  {formatISODate(eventDate.toISOString())}
                  {@const time = formatISODate(
                    event.end?.dateTime,
                    false,
                    false,
                    true,
                    false,
                    false
                  )}
                  {#if time}
                    at {time}
                  {/if}
                {/if}
              {:else if event.end?.date && event.rr}
                {@const eventDate = event.rr.after(new Date(event.end.date))}
                {#if eventDate}
                  {formatISODate(eventDate.toISOString())}
                {/if}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h2>Upcoming events</h2>

  <div class="table-wrapper-inner">
    <table>
      <thead>
        <tr>
          <th align="left">Event</th>
          <th align="left">Start</th>
          <th align="left">End</th>
        </tr>
      </thead>
      <tbody>
        {#each data.calendar.items
          .filter((event) => !event.recurrence || event.recurrence.length === 0)
          .sort( (a, b) => (new Date(a.start?.dateTime || a.start?.date || Date.now()) > new Date(b.start?.dateTime || b.start?.date || Date.now()) ? 1 : -1) ) as event}
          <tr on:click={() => goto(`/events/calendar/primary/event/${event.id}`)}>
            <td>
              <a href="/events/calendar/primary/event/{event.id}">{event.summary}</a>
            </td>
            <td>
              {#if event.start?.dateTime}
                {formatISODate(event.start?.dateTime, false, true, true)}
              {:else if event.start?.date}
                {formatISODate(event.start?.date, false, true, false)}
              {/if}
            </td>
            <td>
              {#if event.end?.dateTime}
                {formatISODate(event.end?.dateTime, false, true, true)}
              {:else if event.end?.date}
                {formatISODate(event.end?.date, false, true, false)}
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  #main-content {
    max-width: 1200px;
    box-sizing: border-box;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
  }

  .table-wrapper-inner {
    width: 100%;
    overflow: auto;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 10%);
    margin: 20px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr {
    font-family: var(--font-detail);
    height: 48px;
    font-size: 14px;
    box-shadow: 0 1px 0 0px rgb(0 0 0 / 10%);
  }

  tbody tr:last-of-type {
    box-shadow: none;
  }

  th {
    color: rgba(0, 0, 0, 0.6);
  }

  th,
  td {
    padding-right: 32px;
    white-space: nowrap;
  }

  th:not(:last-of-type),
  td:not(:last-of-type) {
    width: 1px;
  }

  th:first-of-type,
  td:first-of-type {
    padding-left: 16px;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.15s linear;
  }

  tbody tr a {
    height: 100%;
    color: inherit;
  }

  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.08);
    transition: none;
  }

  tbody tr:active {
    background-color: rgba(0, 0, 0, 0.16);
    transition: background-color 0.15s linear;
  }

  #main-content h2 {
    font-family: var(--font-headline);
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: normal;
    padding-top: 0.7em;
    margin-top: 0;
    margin-bottom: 0.7em;
  }

  #main-content p {
    font-family: var(--font-detail);
    line-height: 1.4;
    letter-spacing: 0.03125em;
    margin: -10px 0 10px 0;
  }
</style>
