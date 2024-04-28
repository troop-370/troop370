<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton, Tooltip } from 'fluent-svelte';
  import ComboBoxItem from 'fluent-svelte/ComboBox/ComboBoxItem.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  export let width = 320;
  export let open = false;

  export let initialMonth: number | undefined = undefined;
  let month = new Date().getMonth() + 1;
  export let initialDay: number | undefined = undefined;
  let day = new Date().getDate();
  export let initialYear: number | undefined = undefined;
  let year = new Date().getFullYear();

  const dispatch = createEventDispatcher<{ select: { month: number; day: number; year: number } }>();

  let positionElement: HTMLDivElement;
  let calendarElement: HTMLDivElement;
  let monthElement: HTMLDivElement;
  let dayElement: HTMLDivElement;
  let yearElement: HTMLDivElement;

  // if the initial value changes while the calendar is closed,
  // update the values to match the initial values
  // (only when closed so it does not change while someone is actively editing)
  $: if (!open) {
    if (initialMonth) month = initialMonth;
    if (initialDay) day = initialDay;
    if (initialYear) year = initialYear;
  }

  let menuHeight = 360;
  $: menuDirection = (() => {
    const tooCloseToTop = positionElement?.getBoundingClientRect().top - 33 < menuHeight / 2;
    if (tooCloseToTop) return 'top';

    const tooCloseToBottom = positionElement?.getBoundingClientRect().bottom < menuHeight / 2;
    if (tooCloseToBottom) return 'bottom';

    return 'center';
  })();
  $: menuOffset = (() => {
    if (menuDirection === 'top') return 0;
    if (menuDirection === 'bottom') return -1 * menuHeight + 70;
    return (-1 * menuHeight) / 2 + 35;
  })();

  $: {
    // retrigger this block when month, day, or year changes
    [month, day, year];

    // vertically scroll month, day, and year selected options to the middle of their scroll containers
    tick().then(() => {
      const selectedMonthElem = monthElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedMonthElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedMonthElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedMonthElem?.offsetTop -
              monthElement?.getBoundingClientRect().height +
              selectedMonthElem?.clientHeight
            : selectedMonthElem?.offsetTop -
              monthElement?.getBoundingClientRect().height / 2 +
              selectedMonthElem?.clientHeight / 2,
        behavior: 'auto',
      });
      const selectedDayElem = dayElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedDayElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedDayElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedDayElem?.offsetTop -
              monthElement?.getBoundingClientRect().height +
              selectedDayElem?.clientHeight
            : selectedDayElem?.offsetTop -
              dayElement?.getBoundingClientRect().height / 2 +
              selectedDayElem?.clientHeight / 2,
        behavior: 'auto',
      });
      const selectedYearElem = yearElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedYearElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedYearElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedYearElem?.offsetTop -
              monthElement?.getBoundingClientRect().height +
              selectedYearElem?.clientHeight
            : selectedYearElem?.offsetTop -
              yearElement?.getBoundingClientRect().height / 2 +
              selectedYearElem?.clientHeight / 2,
        behavior: 'auto',
      });
    });
  }

  // only use smooth scrolling when the selector is open
  let smoothScroll = false;
  $: {
    if (open) {
      setTimeout(() => {
        smoothScroll = true;
      }, 100); // wait 100ms so the first scroll can happen instantly
    } else {
      smoothScroll = false;
    }
  }

  function adjustDay() {
    // confirm that day selection is still a day within the month (e.g., 31 does not always exist)
    const maxDay = new Date(year, month, 0).getDate();
    if (maxDay < day) {
      // set the day to the latest possible day in the month
      day = maxDay;
    }
  }

  // focus the month selection area on focus
  $: if (open) (monthElement?.querySelector('.selected') as HTMLDivElement | undefined)?.focus();

  async function selectMonth(_month: number) {
    (monthElement?.querySelector(`[data-month='${_month}']`) as HTMLDivElement | undefined)?.focus();
    month = _month;
    adjustDay();
  }

  async function selectDay(_day: number) {
    (dayElement?.querySelector(`[data-day='${_day}']`) as HTMLDivElement | undefined)?.focus();
    day = _day;
  }

  async function selectYear(_year: number) {
    (yearElement?.querySelector(`[data-year='${_year}']`) as HTMLDivElement | undefined)?.focus();
    year = _year;
    adjustDay();
  }

  function save() {
    open = false;

    initialMonth = month;
    initialDay = day;
    initialYear = year;

    dispatch('select', { month, day, year });
  }

  function cancel() {
    open = false;

    // revert to initial values
    month = initialMonth ?? new Date().getMonth() + 1;
    day = initialDay ?? new Date().getDate();
    year = initialYear ?? new Date().getFullYear();
  }

  async function handleKeyboardNavigation(evt: Event, column: 'month' | 'day' | 'year', item: number) {
    const { key } = evt as KeyboardEvent;
    evt.stopPropagation();

    if (key === 'Escape') {
      cancel();
      return;
    }

    if (key === 'Space' || key === 'Enter') {
      save();
      return;
    }

    if (key === 'ArrowLeft') {
      if (column === 'month') return;
      if (column === 'day') {
        selectMonth(month);
        return;
      }
      if (column === 'year') {
        selectDay(day);
        return;
      }
    }

    if (key === 'ArrowRight') {
      if (column === 'month') {
        selectDay(day);
        return;
      }
      if (column === 'day') {
        selectYear(year);
        return;
      }
      if (column === 'year') return;
    }

    if (key === 'ArrowDown') {
      if (column === 'month') {
        if (item === 12) return;
        selectMonth(item + 1);
      } else if (column === 'day') {
        const maxDay = new Date(year, month, 0).getDate();
        if (item === maxDay) return;
        selectDay(item + 1);
      } else if (column === 'year') {
        const maxYear = new Date().getUTCFullYear() + 100;
        if (item === maxYear) return;
        selectYear(item + 1);
      }
      return;
    }

    if (key === 'ArrowUp') {
      if (column === 'month') {
        if (item === 1) return;
        selectMonth(item - 1);
      } else if (column === 'day') {
        if (item === 1) return;
        selectDay(item - 1);
      } else if (column === 'year') {
        const minYear = new Date().getUTCFullYear() - 100;
        if (item === minYear) return;
        selectYear(item - 1);
      }
      return;
    }
  }

  function handleFocusOut(evt: FocusEvent) {
    // close the date selector if focus leaves
    if (calendarElement.contains(evt.relatedTarget as Node) === false) {
      open = false;
    }
  }
</script>

<div bind:this={positionElement} />

{#if open}
  <div
    class="calendar direction-{menuDirection}"
    class:smoothScroll
    class:widerYear={width < 360}
    style="width: {width + 10}px; --fds-menu-offset: {menuOffset}px;"
    bind:this={calendarElement}
    on:focusout={handleFocusOut}
  >
    <div class="month" bind:this={monthElement} tabindex="-1">
      {#if menuDirection === 'bottom'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#each ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as monthName, index}
        {@const _month = index + 1}
        <ComboBoxItem
          selected={month === _month}
          on:click={() => selectMonth(_month)}
          data-month={_month}
          on:keydown={(evt) => handleKeyboardNavigation(evt, 'month', _month)}
        >
          {monthName}
        </ComboBoxItem>
      {/each}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#if menuDirection === 'top'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
    </div>
    <div class="day" bind:this={dayElement} tabindex="-1">
      {#if menuDirection === 'bottom'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#each [...Array(new Date(year, month, 0).getDate()).keys()] as _, index}
        {@const _day = index + 1}
        <ComboBoxItem
          selected={day === _day}
          on:click={() => selectDay(_day)}
          data-day={_day}
          on:keydown={(evt) => handleKeyboardNavigation(evt, 'day', _day)}
          style="text-align: center;"
        >
          {_day}
        </ComboBoxItem>
      {/each}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#if menuDirection === 'top'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
    </div>
    <div class="year" bind:this={yearElement} tabindex="-1">
      {#if menuDirection === 'bottom'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#each [...Array(201).keys()] as _, index}
        {@const _year = index - 100 + new Date().getUTCFullYear()}
        <ComboBoxItem
          selected={year === _year}
          on:click={() => selectYear(_year)}
          data-year={_year}
          on:keydown={(evt) => handleKeyboardNavigation(evt, 'year', _year)}
          style="text-align: center;"
        >
          {_year}
        </ComboBoxItem>
      {/each}
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      <ComboBoxItem disabled />
      {#if menuDirection === 'top'}
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
        <ComboBoxItem disabled />
      {/if}
    </div>
    <div class="save">
      <Tooltip text="Save changes to date">
        <IconButton style="width: 100%;" on:click={save}>
          <FluentIcon name="Checkmark16Regular" />
        </IconButton>
      </Tooltip>
      <Tooltip text="Cancel changes to date">
        <IconButton style="width: 100%;" on:click={cancel}>
          <FluentIcon name="Dismiss16Regular" />
        </IconButton>
      </Tooltip>
    </div>
  </div>
{/if}

<style>
  @-webkit-keyframes menu-in {
    0% {
      -webkit-clip-path: var(--fds-grow-clip-path);
      clip-path: var(--fds-grow-clip-path);
    }
    to {
      -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
  }
  @keyframes menu-in {
    0% {
      -webkit-clip-path: var(--fds-grow-clip-path);
      clip-path: var(--fds-grow-clip-path);
    }
    to {
      -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
  }

  .calendar {
    -webkit-margin-before: -6px;
    -webkit-margin-start: -5px;
    -webkit-animation: menu-in var(--fds-control-normal-duration) var(--fds-control-fast-out-slow-in-easing),
      shadow-in var(--fds-control-normal-duration) var(--fds-control-fast-out-slow-in-easing)
        var(--fds-control-normal-duration);
    animation: menu-in var(--fds-control-normal-duration) var(--fds-control-fast-out-slow-in-easing),
      shadow-in var(--fds-control-normal-duration) var(--fds-control-fast-out-slow-in-easing)
        var(--fds-control-normal-duration);
    background-clip: padding-box;
    background-color: var(--fds-solid-background-quarternary);
    border: 1px solid var(--fds-surface-stroke-flyout);
    border-radius: var(--fds-overlay-corner-radius);
    box-shadow: var(--fds-flyout-shadow);
    box-sizing: border-box;
    inline-size: calc(100% + 8px);
    inset-block-start: var(--fds-menu-offset, 0);
    inset-inline-start: 0;
    margin: 0;
    margin-block-start: -6px;
    margin-inline-start: -5px;
    max-block-size: 504px;
    padding: 1px;
    position: absolute;
    z-index: 100;

    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 325px auto;
    grid-template-areas:
      'month    day     year'
      'actions  actions actions';
  }
  .calendar.widerYear {
    grid-template-columns: 1.8fr 1fr 1.2fr;
  }

  .calendar .month,
  .calendar .day,
  .calendar .year {
    overflow-y: auto;
    position: relative;
    scroll-behavior: inherit;
  }

  .calendar .save {
    grid-area: actions;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .calendar.smoothScroll {
    scroll-behavior: smooth;
  }

  .calendar.direction-top {
    --fds-grow-clip-path: polygon(0 0, 100% 0, 100% 25%, 0 25%);
  }
  .calendar.direction-center {
    --fds-grow-clip-path: polygon(0 25%, 100% 24%, 100% 75%, 0 75%);
  }
  .calendar.direction-bottom {
    --fds-grow-clip-path: polygon(0 75%, 100% 75%, 100% 100%, 0 100%);
  }
</style>
