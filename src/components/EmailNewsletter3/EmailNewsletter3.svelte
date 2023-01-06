<script lang="ts">
  import type { Newsletter$result } from '$houdini';
  import { formatISODate, notEmpty } from '$utils';
  import {
    BackgroundTable,
    CalendarMonth,
    ContainerTable,
    HeaderTable,
    MainTable,
    NewsletterMiniPostCard,
    NewsletterPinnedPostCard,
    NewsletterPostCard,
    Number,
  } from '.';
  import NavTable from './NavTable.svelte';

  export let newsletter: NonNullable<Newsletter$result['newsletterPublic']>;
  export let element: HTMLHtmlElement | undefined = undefined;
</script>

<html id="newsletter-doc" lang="en-us" bind:this={element}>
  <head>
    <title>{newsletter.name}</title>
    <style>
      a {
        color: #003f87;
      }
      a:hover {
        background: rgba(0, 77, 170, 0.06);
      }
      a:active {
        background: rgba(0, 77, 170, 0.12);
      }

      @media (max-width: 600px) {
        .hide-600 {
          display: none !important;
        }
      }

      @media (max-width: 380px) {
        .hide-380 {
          display: none !important;
        }
      }

      @media (max-width: 320px) {
        .hide-320 {
          display: none !important;
        }

        .show-inline-320 {
          display: inline !important;
        }
      }

      @media (max-width: 560px) {
        .resources-row,
        .resources-row-cell {
          display: block !important;
          width: 100% !important;
        }
        .announcements-submit {
          margin-top: 24px !important;
        }
      }

      /* hide trouble banner on clients that support media queries */
      @media screen {
        .trouble {
          display: none;
        }
      }
    </style>
  </head>
  <body style="margin: 0;">
    <ContainerTable table$bgcolor="#ffffff">
      <tr>
        <td class="trouble">
          Having trouble viewing this email?
          <a href="https://troop370atlanta.org/newsletters/{newsletter._id}?hideNav=1">
            Click here to view it online
          </a>.
        </td>
      </tr>
    </ContainerTable>

    <BackgroundTable>
      <tr>
        <td>
          <NavTable />
        </td>
      </tr>
      <tr>
        <td>
          <HeaderTable>
            <tr>
              <td>
                <ContainerTable>
                  <tr>
                    <td align="center">
                      <h1
                        style="
                            font-family: roboto, sans-serif;
                            font-size: 24px;
                            color: rgb(224, 224, 224);
                            line-height: 1.2;
                            font-weight: 500;
                            letter-spacing: normal;
                            margin: 5px 0px;
                            text-align: center;
                            max-width: 590px;
                          "
                      >
                        {newsletter.name}
                      </h1>
                      <p
                        style="
                            font-family: roboto, sans-serif;
                            font-size: 16px;
                            color: rgb(224, 224, 224);
                            line-height: 1;
                            font-weight: 400;
                            letter-spacing: normal;
                            margin: 0px 0px 10px;
                            text-align: center;
                            max-width: 590px;
                          "
                      >
                        {formatISODate(
                          new Date(newsletter.timestamps?.published_at || new Date()).toISOString(),
                          false,
                          true,
                          false
                        )}
                      </p>
                    </td>
                  </tr>
                </ContainerTable>
              </td>
            </tr>
          </HeaderTable>
        </td>
      </tr>
      <tr>
        <td>
          <table style="border-radius: 4px; background: #ffffff; width: 100%;">
            <tr>
              <td align="center" style="padding: 0 20px;">
                <MainTable>
                  {#if newsletter.pinned_mini_posts && newsletter.pinned_mini_posts.filter(notEmpty).length > 0}
                    {#each newsletter.pinned_mini_posts.filter(notEmpty) as post, index}
                      <tr>
                        <td>
                          <NewsletterPinnedPostCard
                            name={post.name}
                            description={post.description}
                            slug={post.slug}
                            buttonText={post.button_text}
                            number={index + 1}
                            category={post.categories[0] || ''}
                          />
                        </td>
                      </tr>
                    {/each}
                  {/if}
                  {#if newsletter.announcements && newsletter.announcements.filter(notEmpty).length > 0}
                    {#each newsletter.announcements.filter(notEmpty) as post, index}
                      <tr>
                        <td>
                          <NewsletterPostCard
                            name={post.name}
                            description={post.description}
                            body={post.body}
                            type={post.legacy_markdown === true ? 'markdown' : 'prosemirror'}
                            number={index + 1 + (newsletter.pinned_mini_posts?.length || 0)}
                            category={post.categories[0] || ''}
                          />
                        </td>
                      </tr>
                    {/each}
                  {/if}
                  <NewsletterMiniPostCard
                    label={'Past announcements'}
                    posts={newsletter.past_announcements?.filter(notEmpty) || []}
                    numberStart={1 +
                      (newsletter.pinned_mini_posts?.length || 0) +
                      (newsletter.announcements?.length || 0)}
                  />
                  {#if newsletter.manual_calendar && newsletter.manual_calendar.filter(notEmpty).length > 0}
                    <tr>
                      <td>
                        <h2 class="section-title">
                          <Number
                            number={1 +
                              (newsletter.pinned_mini_posts?.length || 0) +
                              (newsletter.announcements?.length || 0) +
                              1}
                            category="meeting"
                          />
                          <span>Calendar</span>
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table
                          width="100%"
                          border={0}
                          cellpadding={0}
                          style="
                              border: none;
                              padding: 0px;
                              width: 100%;
                              background: none;
                              border-collapse: collapse;
                            "
                        >
                          <tr>
                            <td>
                              <ContainerTable>
                                <tr>
                                  <td>
                                    <ContainerTable>
                                      <tr>
                                        <td>
                                          <ContainerTable>
                                            {#each newsletter.manual_calendar.filter(notEmpty) as { month, events }}
                                              {#if month && events}
                                                <CalendarMonth {month} eventsMarkdown={events} />
                                              {/if}
                                            {/each}
                                          </ContainerTable>
                                        </td>
                                      </tr>
                                    </ContainerTable>
                                  </td>
                                </tr>
                              </ContainerTable>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  {/if}
                  <tr>
                    <td>
                      <h2 class="section-title">
                        <Number
                          number={1 +
                            (newsletter.pinned_mini_posts?.length || 0) +
                            (newsletter.announcements?.length || 0) +
                            (newsletter.manual_calendar &&
                            newsletter.manual_calendar.filter(notEmpty).length > 0
                              ? 1
                              : 0) +
                            1}
                          category="camping"
                        />
                        <span>Resources</span>
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ContainerTable
                        table$style="margin: 10px 0 8px 0; font-family: Roboto, sans-serif; font-size: 14.5px; line-height: 1.5;"
                      >
                        <tr class="resources-row">
                          <td width="220" valign="top" class="resources-row-cell">
                            <ContainerTable>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org">Troop 370 Website</a>
                                </td>
                              </tr>
                              <tr>
                                <td>Website password: sheetbend</td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org/events"
                                    >Upcoming Troop Events</a
                                  >
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org/calendar">PDF Calendar</a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org/posts">Posts archive</a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org/payments">Make a payment</a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370atlanta.org/contact">Contact</a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://www.facebook.com/groups/126169727423188/">
                                    Join us on Facebook
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://www.instagram.com/bsatroop370/">
                                    Follow us on Instagram
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <a href="https://troop370.smugmug.com/">View photos on SmugMug</a>
                                </td>
                              </tr>
                            </ContainerTable>
                          </td>
                          <td
                            valign="top"
                            width="440"
                            class="resources-row-cell announcements-submit"
                          >
                            <p>
                              You can submit your announcements for the weekly email, website, or
                              reminder text.
                            </p>
                            <p>
                              Submit email announcements to
                              <a href="sheri.buehner@troop370atlanta.org">Sheri Buehner</a>. Please
                              submit your announcement by Sunday at noon.
                            </p>
                            <p>
                              Submit website announcements and reminder texts to
                              <a href="jack.buehner@troop370atlanta.org">Jack Buehner</a>. Please
                              submit your reminder at least 48 hours in advance. Reminder texts have
                              a 115-character limit.
                            </p>
                          </td>
                        </tr>
                      </ContainerTable>
                    </td>
                  </tr>
                </MainTable>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </BackgroundTable>
  </body>
</html>

<style>
  h2.section-title {
    font-family: roboto, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: normal;
    margin: 24px 0 2px 0;
    color: rgb(0, 0, 0) !important;
  }

  h2.section-title span {
    vertical-align: middle;
  }

  .resources-row a {
    color: #003f76;
  }

  .resources-row p {
    margin: 0 0 8px 0;
  }

  .trouble {
    background-color: #ffffff;
    padding: 4px 20px;
    font-family: roboto, sans-serif;
    color: #333333;
    font-size: 13.5px;
    border-radius: 10px 10px 0 0;
  }

  .trouble a {
    color: #333333;
  }

  /* make width automatic for clients that support css */
  @media screen {
    .announcements-submit {
      width: unset;
    }
  }
</style>
