<script lang="ts">
  import { page } from '$app/stores';
  import Accordion, {
    Content as AccordionContent,
    Header as AccordionHeader,
    Panel as AccordionPanel,
  } from '@smui-extra/accordion';
  import { Svg } from '@smui/common';
  import Drawer, { Content, Scrim } from '@smui/drawer';
  import IconButton, { Icon } from '@smui/icon-button';
  import { Item, Separator, Text } from '@smui/list';
  import type { NavigationGroup } from '.';

  export let open = true;

  export let groups: NavigationGroup[];

  let active = 'Inbox';

  function setActive(value: string) {
    active = value;
    open = false;
  }

  let accordianOpen: Record<string, boolean> = {};
</script>

<div class="drawer-container">
  <Drawer variant="modal" fixed={true} bind:open class="drawer">
    <div class="header">
      <svg
        class="bugler"
        xmlns="http://www.w3.org/2000/svg"
        width="60"
        height="119"
        viewBox="0 0 215.4 370.4"
        style="fill:currentColor;"
      >
        <path
          d="M32.9 370l-.5-1.4-.8-2.9c-.4-1-.6-2.2-.6-2.6l-.6-2.6c-.3-1-.4-2-.3-2.4 0-.3 0-.9-.2-1.2-.4-.8-1-5.4-1.3-10.6l-.6-7.8a123.6 123.6 0 0 1 .7-25c.4-1 .9-1.6 3.4-4.1 1.3-1.4 1.5-2.7 1-6.4 0-1 0-1.7.3-2.4 2-5 2-5.2 2.5-11.4a16 16 0 0 0-.8-7.6c-.8-2.1-.9-3.4-.3-4.5.4-.7.4-1 0-2.3l-1-3.6a15 15 0 0 1-.9-4.5c-.2-3.5-.5-4.8-2-7.8-.8-1.8-1.3-3.2-1.4-4.2a41.2 41.2 0 0 1-1-13c0-5.1-.2-10.5-.3-12-.2-2.6-.3-2.7-1-3.4l-1.3-.6a2 2 0 0 1-1-.4c-.2-.2-.8-.4-1.3-.5-.8-.2-4.5-3.1-5.5-4.4-.7-.8-.5-2 2.1-9.8.3-.7.6-2 .7-3 .2-1.7.7-4.2 1.6-8.7l.2-4v-2.6l-2.2-2.5a30.2 30.2 0 0 1-5.8-9.8 13 13 0 0 0-1.7-3.2 49 49 0 0 1-1.6-7.9c0-.4-.4-2-1-3.6-.6-1.9-.9-3.4-.9-4.3 0-.8-.2-2-.4-2.6a777.7 777.7 0 0 0-1.3-12.6 131 131 0 0 1-.4-9.4c0-3.4-.1-5.6-.4-6.9l-.4-3.2c0-1.5 1-7 1.4-8.2l.5-3c.1-1.4.4-2.8.6-3.2.2-.4.4-1.2.4-1.8 0-1.6 1-4.9 1.7-6 .8-1.2.8-1.4.3-3-.7-2-.3-3.7 2-7.3a61.2 61.2 0 0 0 3.9-8.5l.8-2 1.3-2.7 1.7-2.9a14 14 0 0 1 1.8-2.5l1.6-2.2 1.1-1.9c.4-.4 1.8-2 3-3.6 2.2-2.6 2.3-2.8 2.1-3.7-.5-3.1-.4-3.4 1.1-3.6 1.1-.2 1.2-.3 1.2-1.8 0-1.7-.7-2.8-2.2-3.8a21.8 21.8 0 0 1-5.6-4.8C24 48.2 24 48 23 48.3c-.5 0-1 .3-1.3.5-.6.5-4.8 2.6-7.2 3.5l-2.8 1.3c-.8.7-6.4 2-8.8 2-1.1.1-1 .1-2.6-1.8-.4-.4-.4-.9-.1-.9l.7-1.4c.3-.7.8-1.7 1.2-2.1a40 40 0 0 1 8.6-6.3l2.8-2c3-2 2.7-1.7 2.7-4a24.3 24.3 0 0 0-.8-5.9c0-.6-.3-1.7-.5-2.3-.3-.9-.4-1.7-.3-3.4.1-1.3.3-2.5.5-2.6l.2-1c0-.5.3-1.3.6-2l.5-1.2c0-.4 1.7-3 2.4-3.8a70.8 70.8 0 0 1 11-11.8l1.3-.5c1-.6 1.4-.6 7.1-.6a25.6 25.6 0 0 1 10.4 1.3c1 .3 2.1.8 2.7 1.2.5.5 1.2.8 1.5.8a8 8 0 0 1 2.4 1 31.3 31.3 0 0 1 9 8.3c1.5 2.4 2 2.7 3.6 1.9l1.6-.8c.3-.2 1-.4 1.3-.4.7 0 4.7-1.2 5.1-1.6a22 22 0 0 1 6.5-1.5c1.5-.2 3.1-.5 3.6-.7 1.3-.6 2.2-.5 3.1.3.7.6.8.9.8 2 0 1.6-1 3.9-2 4.6a24.3 24.3 0 0 1-5.6 3.2c-.8.2-2 .7-2.6 1a19 19 0 0 1-4.5 1.7l-1.2.4-1.8.7c-2.4.8-2.7 1.4-1.7 4 .6 1.6 1.3 2.4 2.3 2.9.4.1 1 .7 1.5 1.3.4.6 1.3 1.4 2 1.8 2.1 1.3 4.5 3.4 4.5 4.1 0 .4-.6 1.2-1.6 2-2.6 2.5-2.5 2.6 4 2.5h5.6l1-.8c1.5-1.2 1.6-1.2 3.6-1.4 5.7-.6 7.2-1 8-2l.8-.4c.5 0 1.2-.7 2.1-2.2.4-.5 1.2-1.3 1.8-1.7l1.7-1.1c1.7-1.1 3.9-1.2 20.5-.8 1 0 4.5-.6 5.1-.9l2.7-.7 2.7-.7a4 4 0 0 1 1.4-.4c.5 0 1-.1 1.4-.3a4 4 0 0 1 1.7-.4c.5 0 1-.2 1.2-.4.2-.2.8-.4 1.3-.5.6 0 1.4-.3 1.8-.4a58 58 0 0 1 4-1l4-1c1.3-.5 3.6-1.1 5.5-1.5l2.4-.6 1.8-.4 1.8-.5c1.1-.5 3.4-1.1 4-1.1l1.6-.4 2-.6c.7 0 1.7-.5 2.3-.8.6-.4 1.3-.8 1.7-.8 1.3-.1 2.3-.4 2.9-1 .3-.2 1-.4 1.5-.4.7 0 1-.2 1.7-1a4 4 0 0 1 1.7-1c.4-.1 1.2-.5 1.7-1 .4-.4 1.1-.8 1.5-.9.4 0 1-.3 1.2-.5l1.5-.8c.6-.2 1.1-.6 1.1-.7 0-.1.4-.5 1-.8.5-.3 1-.8 1.1-1.2a27 27 0 0 0 7.1-7c1.3-2.4 1.4-2.6 2-3 .2 0 .5-.4.5-.6 0-.2.3-.3.7-.3.6 0 .8.1.8.4 0 .2.5.9 1 1.4l.9 1.2 1 2c.7 1 1.3 2.3 1.4 2.7.2 1 1 3.2 1.8 4.8 1.4 3.2 1.5 3.3 2 9.3.1 1 .3 1.7.4 1.7.2 0 .3 1.6.3 3.6 0 3.5 0 3.6-.7 4.4-1 1-1.4 1-2.2.1-.4-.3-.8-.6-1-.6-.3 0-1-.6-1.6-1.4-.8-.9-1.5-1.4-2.2-1.6-.6-.1-1.4-.5-1.8-.9-.4-.3-1-.6-1.3-.6-.3 0-.8-.2-1.1-.5-.6-.4-1.2-.4-4-.4-7.4.1-10.7.5-11.6 1.3l-1 .4c-.6.3-.5.6.8 1.5l2 2c.7 1.2 2 4 2.2 5.3.2 1-.2 3.6-.8 5.4-1.5 4.1-3.2 6.3-5.5 6.9l-1.3.5c-.1.2-.5.3-.9.3s-1.5.3-2.6.7c-2.3.8-5.4 1.6-11.5 2.8A43 43 0 0 0 164 54c-.6.2-1.4.4-1.9.4-.8 0-1.6.2-4.3 1l-2.2.4c-.5 0-1.3.2-1.7.4-2.3.8-3.6 1.1-4.4 1.1-.4 0-1.2.2-1.5.4l-2.7.7a56.2 56.2 0 0 0-8.2 1.8l-2.7.8c-.3.2-1.4.4-2.4.5-2 .1-3.4.8-3.4 1.6 0 .6-.2 1.2-.5 2.2-.2.5-.4 2-.6 3.4a10 10 0 0 1-.5 2.7c-.1.2-.3 1-.3 1.7 0 1.4 0 1.7-1.9 5.6l-.7 1.1c-.1 0-1 .9-1.9 2a9 9 0 0 1-2 2c-.2 0-1.2.7-2.3 1.5-2.8 2.3-8 5-12.7 6.4l-2.7 1c-.4.2-1.8.5-3.2.6a12 12 0 0 0-3.7.8c-1.3.6-4 1.4-6.2 1.9-.8.2-1.7.6-2.4 1.3-1 .9-1.1 1-1 2 0 .7.5 2.3 1.3 4a70 70 0 0 1 4.1 9.3l.4.7.4.6c.3.5 1.2 2.9 1.7 4.7.2.5.4 5 .6 9.8.1 6.3.3 9 .6 9.5 1 2 1 2.7 1 4.9a163.6 163.6 0 0 0 1 23.7c0 .6.2 1.6.5 2.4.3.8.7 2.3.8 3.3.2 1 .7 2.9 1.2 4.2.6 1.5 1 3.2 1.3 5a91 91 0 0 0 1.6 9.3c.2.6.5 2.3.5 3.8.2 3 .7 6.1 1 6.8.3.6 1 4.2 1 5.2 0 .5.2 1.3.4 1.8.3.5.4 1.2.4 1.5 0 .2.2.8.5 1.3.3.6.5 2 .6 5.4.3 5.4.1 6-2 7.8a20.5 20.5 0 0 1-5 3.4c-.4 0-2.3 1.5-3.1 2.5a55 55 0 0 0-2.7 9.8c-.5 2.8-.7 3.2-1.5 4.5-.5.6-.8 1.3-.8 1.5l-.4.9a30.1 30.1 0 0 0-2 8.6c-.1.9-.4 2-.9 2.9l-.7 2c0 .3-.2.9-.5 1.4-.3.5-.5 1.1-.5 1.4 0 .4-.2 1-.4 1.3-.2.3-.4 1-.4 1.3l-.4 1.3a16 16 0 0 0-1.5 4c-.1.8-.5 1.8-.7 2.3-.2.5-.3 1.3-.3 1.8l-.3 1.6c-.4 1-1 5-1.3 8.9-.4 5.3-1.1 7.8-3 10.4l-.9 2.1c-.6 2-1.6 3.3-4.5 6.5-.8.8-1.4 1.6-1.4 1.8 0 .2-.3.5-.7.7-1.3.7-3 2.4-3.6 3.7-.6 1-.6 1.4-.4 2 .6 1.8.4 3.2-.7 5-.9 1.4-1 1.7-1 3.4 0 1-.1 2.3-.3 2.8-.2.6-.5 2.1-.6 3.4a9.1 9.1 0 0 1-.6 3c-.3.5-.6 1.2-.7 1.8a6 6 0 0 1-.8 1.8c-1.1 1.8-1.2 2.4-1.1 9.8 0 5.8 0 7-.3 7.6-.4.6-.4 2.2-.5 8.5v10.3H46.7c-12.8 0-13.6 0-13.9-.5zm36-303.5l2.3-.9c1.4-.7 5.5-.8 6.2-.1.5.5 1.8 1 3 1 .6 0 1.4 0 1.7.2.7.3.8.2 1.6-.5.7-.7 1-.8 2.1-.8.7 0 1.5-.2 1.9-.5.3-.2 1.6-.5 2.8-.7a7 7 0 0 0 3-1.1c.8-.6 1.2-.7 2-.6.9.1 1.4 0 3-.8 1.8-1 2.8-2 2.8-3 0-.4-.2-.5-3.2-.6-4.3-.1-6.4-.6-9.4-2.2-2.1-1-2.7-1.5-4.1-3.2-1.6-1.9-1.7-1.9-3-1.9-1 0-1.3.1-1.7.6-.7.8-.7 1.6.1 3.1.9 1.7.9 3.1 0 4.5-.3.6-.9 1.2-1.1 1.3a12.6 12.6 0 0 1-5.7 2l-5 .1h-3.6l-.7 1.1c-1 1.5-.9 2.2.2 2.9 1 .7 2.8.7 4.8.1zm64-10.6l3.5-.9a52.3 52.3 0 0 0 5.7-1.3c2.3-.5 4.5-1.1 5.7-1.5a24 24 0 0 1 3.3-.6c1.8-.2 3.4-.7 4.1-1.1l1.5-.4c1.4-.2 3.6-.9 4.3-1.3a4 4 0 0 1 1.7-.4c1.6 0 4-.4 5.4-1a6 6 0 0 1 1.8-.3l.9-.2c0-.2.7-.4 1.4-.5a6 6 0 0 0 1.7-.5c.3-.2 1.7-.5 3-.6a12 12 0 0 0 3.3-.9l2.2-1.2c1-.6 1.4-1 1.8-2 .9-2.2.4-5-1-6.6-1.7-1.7-4.5-1.9-8.7-.4l-3.3.6c-1.4.2-3 .6-3.5.8-.8.3-2.4.7-5 1.2a83.6 83.6 0 0 1-9.7 2.1l-3.4.8c-2.3.7-5.3 1.4-7.3 1.8a95.6 95.6 0 0 0-10 2.5c-1.4.3-3 .7-3.5 1l-.9.4-.2 2.5c-.2 1.7-.1 3 0 4l.4 2.2c0 .4.2 1 .7 1.5 1 1 2 1 4.2.3zM101.5 54c.4-.4.4-.8.2-3.5-.1-1.6-.2-3.4 0-3.8 0-1.1-.2-1.3-2.1-1.2-1 0-1.6.2-2 .5a3 3 0 0 1-1.5.7c-2.5.3-3.3.5-4.2 1-.5.3-1.6.6-2.4.7-1.4.1-1.4.2-1.5 1-.1 1 .7 2.2 1.6 2.2.2 0 .8.4 1.2.8.6.7 1 .9 2 1a4 4 0 0 1 1.9.6c.6.6 2 .7 4.5.6 1.2-.1 2-.3 2.3-.6z"
        />
      </svg>
      <p class="title">BSA Troop 370</p>
      <p class="location">Atlanta, GA</p>
      <div class="social-icons">
        <IconButton href="https://www.facebook.com/groups/126169727423188/">
          <Icon component={Svg} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H15.5A3.5,3.5 0 0,0 12,8.5V11H10V14H12V21H15V14H18V11H15V9A1,1 0 0,1 16,8H18V5Z"
            />
          </Icon>
        </IconButton>
        <IconButton href="https://www.instagram.com/bsatroop370/">
          <Icon component={Svg} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
            />
          </Icon>
        </IconButton>
        <IconButton href="https://troop370.smugmug.com/">
          <Icon component={Svg} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z"
            />
          </Icon>
        </IconButton>
      </div>
    </div>
    <Content>
      <Separator />
      <Item href="/" class="drawer--list-item" activated={$page.url.pathname === '/'}>
        <Text>Home</Text>
      </Item>
      <Separator />
      {#each groups as { label, items }, index}
        {#if items.length === 1}
          <Item
            href={items[0].path}
            class="drawer--list-item"
            activated={$page.url.pathname === items[0].path}
          >
            <Text>{label}</Text>
          </Item>
        {:else}
          <Accordion class="drawer--accordian">
            <AccordionPanel bind:open={accordianOpen[`${index}`]}>
              <AccordionHeader
                class={!accordianOpen[`${index}`] &&
                items.some((item) => $page.url.pathname === item.path)
                  ? 'activated'
                  : ''}
              >
                {label}
                <IconButton
                  slot="icon"
                  toggle
                  pressed={accordianOpen[`${index}`]}
                  size="mini"
                  ripple={false}
                >
                  <Icon class="material-icons" on>expand_less</Icon>
                  <Icon class="material-icons">expand_more</Icon>
                </IconButton>
              </AccordionHeader>

              <AccordionContent>
                {#each items as { label, path }, index}
                  <Item
                    href={path}
                    class="drawer--list-item"
                    activated={$page.url.pathname === path}
                  >
                    <Text>{label}</Text>
                  </Item>
                {/each}
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        {/if}
      {/each}
      <Separator />
      <Item
        href="https://tmweb.troopmaster.com/mysite/troop370atl"
        class="drawer--list-item"
        activated={false}
      >
        <Text>TroopMaster</Text>
      </Item>
      <Separator />
      <Item href="/contact-webmaster" class="drawer--list-item">
        <Text>Help & Feedback</Text>
      </Item>
      <Item href="/information/cookies" class="drawer--list-item">
        <Text>Cookie Policy</Text>
      </Item>
      <Item href="https://github.com/troop-370/troop370/tree/main" class="drawer--list-item">
        <Text>Source Code</Text>
      </Item>
    </Content>
  </Drawer>

  <Scrim />
</div>

<style>
  .drawer-container {
    position: fixed;
    top: 0;
    z-index: 100;
  }

  .drawer-container :global(.drawer--list-item) {
    margin: 0;
    padding: 0 16px;
    --mdc-ripple-color: var(--color-primary);
  }

  .drawer-container :global(.drawer--accordian .smui-accordion__panel::before) {
    box-shadow: none !important;
  }

  .drawer-container :global(.drawer--accordian .smui-paper__content) {
    padding: 0 !important;
  }

  .drawer-container :global(.drawer--accordian .smui-paper__content .drawer--list-item) {
    padding-left: 32px;
  }

  .drawer-container :global(.drawer--accordian .smui-accordion__header__title) {
    margin: 0;
    padding: 0 !important;
    font-size: 14px;
  }

  .drawer-container :global(.drawer--accordian .activated) {
    color: var(--color-primary);
  }
  .drawer-container :global(.drawer--accordian .activated::before) {
    background: var(--color-primary);
    opacity: 0.12;
    top: calc(50% - 100%);
    left: calc(50% - 100%);
    width: 200%;
    height: 200%;
  }

  .drawer-container :global(.drawer--accordian .smui-accordion__header) {
    height: 40px;
    padding: 0 4px 0 16px;
    display: flex;
    align-items: center;
    font-weight: 500;
    --mdc-ripple-color: var(--color-primary);
  }

  .drawer-container :global(.drawer--accordian .smui-accordion__header__icon) {
    margin: 0;
    padding: 0 !important;
  }
  .drawer-container :global(.drawer--accordian .smui-accordion__header__icon .material-icons) {
    font-size: 16px;
    font-weight: 400;
  }
  .drawer-container
    :global(.drawer--accordian .smui-accordion__header__icon .mdc-icon-button__ripple) {
    display: none;
  }

  .header {
    height: 116px;
    flex-shrink: 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  svg.bugler {
    height: 119px;
    width: 60px;
    display: block;
    line-height: 48px;
    position: absolute;
    margin: 9px 0 0 20px;
    color: var(--color-primary);
  }

  .title,
  .location {
    font-family: var(--font-headline);
    font-weight: 500;
    line-height: 24px;
    color: var(--color-primary);
    margin-left: 80px;
    letter-spacing: normal;
  }
  .title {
    font-size: 20px;
    padding: 0 16px;
    margin-top: 18px;
    margin-bottom: 22px;
  }
  .location {
    font-size: 16px;
    padding: 0 16px;
    margin-top: -24px;
  }
  .social-icons {
    display: flex;
    flex-direction: row;
    margin: -15px 0 0 85px;
    gap: 4px;
    --mdc-ripple-color: var(--color-primary);
  }
  .social-icons :global(svg) {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    color: var(--color-primary);
  }

  * :global(.drawer) {
    width: 300px;
    user-select: none;
  }
  * :global(.drawer.mdc-drawer--open) {
    overflow-y: auto;
  }
  * :global(.mdc-drawer__content) {
    overflow: unset;
  }
</style>
