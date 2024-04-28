<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton, Tooltip } from 'fluent-svelte';
  import ComboBoxItem from 'fluent-svelte/ComboBox/ComboBoxItem.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  export let width = 320;
  export let open = false;

  export let initialHour: number | undefined = undefined;
  let hour = new Date().getHours() + 1;
  export let initialMinute: number | undefined = undefined;
  let minute = new Date().getMinutes();
  export let initialAm: 'AM' | 'PM' | undefined = undefined;
  let am: 'AM' | 'PM' = new Date().getHours() >= 12 ? 'PM' : 'AM';

  const dispatch = createEventDispatcher<{ select: { hour: number; minute: number } }>();

  let positionElement: HTMLDivElement;
  let selectorElement: HTMLDivElement;
  let hourElement: HTMLDivElement;
  let minuteElement: HTMLDivElement;
  let amElement: HTMLDivElement;

  // if the initial value changes while the selector is closed,
  // update the values to match the initial values
  // (only when closed so it does not change while someone is actively editing)
  $: if (!open) {
    if (initialHour) hour = initialHour;
    if (initialMinute) minute = initialMinute;
    if (initialAm) am = initialAm;
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
    // retrigger this block when hour, minute, or am changes
    [hour, minute, am];

    // vertically scroll hour, minute, and am selected options to the middle of their scroll containers
    tick().then(() => {
      const selectedHourElem = hourElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedHourElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedHourElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedHourElem?.offsetTop -
              hourElement?.getBoundingClientRect().height +
              selectedHourElem?.clientHeight
            : selectedHourElem?.offsetTop -
              hourElement?.getBoundingClientRect().height / 2 +
              selectedHourElem?.clientHeight / 2,
        behavior: 'auto',
      });
      const selectedMinuteElem = minuteElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedMinuteElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedMinuteElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedMinuteElem?.offsetTop -
              hourElement?.getBoundingClientRect().height +
              selectedMinuteElem?.clientHeight
            : selectedMinuteElem?.offsetTop -
              minuteElement?.getBoundingClientRect().height / 2 +
              selectedMinuteElem?.clientHeight / 2,
        behavior: 'auto',
      });
      const selectedAmElem = amElement?.querySelector('.selected') as HTMLElement | undefined;
      selectedAmElem?.parentElement?.scrollTo({
        top:
          menuDirection === 'top'
            ? selectedAmElem?.offsetTop - 3
            : menuDirection === 'bottom'
            ? selectedAmElem?.offsetTop -
              hourElement?.getBoundingClientRect().height +
              selectedAmElem?.clientHeight
            : selectedAmElem?.offsetTop -
              amElement?.getBoundingClientRect().height / 2 +
              selectedAmElem?.clientHeight / 2,
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

  // focus the hour selection area on focus
  $: if (open) (hourElement?.querySelector('.selected') as HTMLDivElement | undefined)?.focus();

  async function selectHour(_hour: number) {
    (hourElement?.querySelector(`[data-hour='${_hour}']`) as HTMLDivElement | undefined)?.focus();
    hour = _hour;
  }

  async function selectMinute(_minute: number) {
    (minuteElement?.querySelector(`[data-minute='${_minute}']`) as HTMLDivElement | undefined)?.focus();
    minute = _minute;
  }

  async function selectAm(_am: 'AM' | 'PM') {
    (amElement?.querySelector(`[data-am='${_am}']`) as HTMLDivElement | undefined)?.focus();
    am = _am;
  }

  function save() {
    open = false;

    initialHour = hour;
    initialMinute = minute;
    initialAm = am;

    dispatch('select', { hour: am === 'AM' ? hour : hour + 12, minute });
  }

  function cancel() {
    open = false;

    // revert to initial values
    hour = initialHour ?? new Date().getHours() + 1;
    minute = initialMinute ?? new Date().getMinutes();
    am = initialAm ?? new Date().getHours() >= 12 ? 'PM' : 'AM';
  }

  async function handleKeyboardNavigation(evt: Event, column: 'am', item: 'AM' | 'PM'): Promise<void>;
  async function handleKeyboardNavigation(evt: Event, column: 'hour' | 'minute', item: number): Promise<void>;
  async function handleKeyboardNavigation(
    evt: Event,
    column: 'hour' | 'minute' | 'am',
    item: number | 'AM' | 'PM'
  ): Promise<void> {
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
      if (column === 'hour') return;
      if (column === 'minute') {
        selectHour(hour);
        return;
      }
      if (column === 'am') {
        selectMinute(minute);
        return;
      }
    }

    if (key === 'ArrowRight') {
      if (column === 'hour') {
        selectMinute(minute);
        return;
      }
      if (column === 'minute') {
        selectAm(am);
        return;
      }
      if (column === 'am') return;
    }

    if (key === 'ArrowDown') {
      if (column === 'hour' && typeof item === 'number') {
        if (item === 12) return;
        selectHour(item + 1);
      } else if (column === 'minute' && typeof item === 'number') {
        if (item === 59) return;
        selectMinute(item + 1);
      } else if (column === 'am') {
        if (item === 'PM') return;
        selectAm('AM');
      }
      return;
    }

    if (key === 'ArrowUp') {
      if (column === 'hour' && typeof item === 'number') {
        if (item === 1) return;
        selectHour(item - 1);
      } else if (column === 'minute' && typeof item === 'number') {
        if (item === 1) return;
        selectMinute(item - 1);
      } else if (column === 'am') {
        if (item === 'AM') return;
        selectAm('PM');
      }
      return;
    }
  }

  function handleFocusOut(evt: FocusEvent) {
    // close the selector if focus leaves
    if (selectorElement.contains(evt.relatedTarget as Node) === false) {
      open = false;
    }
  }
</script>

<div bind:this={positionElement} />

{#if open}
  <div
    class="selector direction-{menuDirection}"
    class:smoothScroll
    style="width: {width + 10}px; --fds-menu-offset: {menuOffset}px;"
    bind:this={selectorElement}
    on:focusout={handleFocusOut}
  >
    <div class="hour" bind:this={hourElement} tabindex="-1">
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
      {#each [...Array(12).keys()] as _, index}
        {@const _hour = index + 1}
        <ComboBoxItem
          selected={hour === _hour}
          on:click={() => selectHour(_hour)}
          data-hour={_hour}
          on:keydown={(evt) => handleKeyboardNavigation(evt, 'hour', _hour)}
          style="text-align: center;"
        >
          {_hour}
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
    <div class="minute" bind:this={minuteElement} tabindex="-1">
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
      {#each [...Array(60).keys()] as _, index}
        {@const _minute = index + 1}
        <ComboBoxItem
          selected={minute === _minute}
          on:click={() => selectMinute(_minute)}
          data-minute={_minute}
          on:keydown={(evt) => handleKeyboardNavigation(evt, 'minute', _minute)}
          style="text-align: center;"
        >
          {_minute}
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
    <div class="am" bind:this={amElement} tabindex="-1">
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
      <ComboBoxItem
        selected={am === 'AM'}
        on:click={() => selectAm('AM')}
        data-am={'AM'}
        on:keydown={(evt) => handleKeyboardNavigation(evt, 'am', 'AM')}
        style="text-align: center;"
      >
        AM
      </ComboBoxItem>
      <ComboBoxItem
        selected={am === 'PM'}
        on:click={() => selectAm('PM')}
        data-am={'PM'}
        on:keydown={(evt) => handleKeyboardNavigation(evt, 'am', 'PM')}
        style="text-align: center;"
      >
        PM
      </ComboBoxItem>
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

  .selector {
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
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 325px auto;
    grid-template-areas:
      'hour    minute     am'
      'actions  actions actions';
  }

  .selector .hour,
  .selector .minute,
  .selector .am {
    overflow-y: auto;
    position: relative;
    scroll-behavior: inherit;
  }

  .selector .save {
    grid-area: actions;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .selector.smoothScroll {
    scroll-behavior: smooth;
  }

  .selector.direction-top {
    --fds-grow-clip-path: polygon(0 0, 100% 0, 100% 25%, 0 25%);
  }
  .selector.direction-center {
    --fds-grow-clip-path: polygon(0 25%, 100% 24%, 100% 75%, 0 75%);
  }
  .selector.direction-bottom {
    --fds-grow-clip-path: polygon(0 75%, 100% 75%, 100% 100%, 0 100%);
  }
</style>
