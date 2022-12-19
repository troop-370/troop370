<script lang="ts">
  import type { Newsletter$result } from '$houdini';
  import { formatISODate, notEmpty } from '$utils';
  import {
    BackgroundTable,
    CardTable,
    ContainerTable,
    HeaderTable,
    MainTable,
    NewsletterMiniPostCard,
    NewsletterPostCard,
    ResourceRow,
    CalendarMonth,
    NewsletterPinnedPostCard,
  } from '.';

  export let newsletter: NonNullable<Newsletter$result['newsletterPublic']>;
  export let element: HTMLHtmlElement | undefined = undefined;
</script>

<html id="newsletter-doc" lang="en-us" bind:this={element}>
  <body style="margin: 0;">
    <BackgroundTable>
      <MainTable>
        <tr>
          <td>
            <HeaderTable>
              <tr>
                <td>
                  <ContainerTable>
                    <tr>
                      <td class="noPaddingOutlook">
                        <ContainerTable>
                          <tr>
                            <td align="center">
                              <img
                                data-imagetype="External"
                                src="https://troop370atlanta.org/img/troop370-logo/logo_layout2_white_email.png"
                                alt="Scouts BSA Troop 370"
                                width={200}
                                border={0}
                                hspace={0}
                                vspace={0}
                                style="display: block;"
                              />
                            </td>
                          </tr>
                        </ContainerTable>
                      </td>
                    </tr>
                    <tr>
                      <td>
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
                            "
                        >
                          {formatISODate(
                            new Date(newsletter.newsletter_date || new Date()).toISOString(),
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
        {#if newsletter.pinned_mini_posts && newsletter.pinned_mini_posts.filter(notEmpty).length > 0}
          {#each newsletter.pinned_mini_posts.filter(notEmpty) as post}
            <tr>
              <td>
                <NewsletterPinnedPostCard
                  name={post.name}
                  description={post.description}
                  slug={post.slug}
                  buttonText={post.button_text}
                />
              </td>
            </tr>
          {/each}
        {/if}
        {#if newsletter.announcements && newsletter.announcements.filter(notEmpty).length > 0}
          {#each newsletter.announcements.filter(notEmpty) as post}
            <tr>
              <td>
                <NewsletterPostCard
                  name={post.name}
                  description={post.description}
                  body={post.body}
                  type={post.legacy_markdown === true ? 'markdown' : 'prosemirror'}
                />
              </td>
            </tr>
          {/each}
        {/if}
        {#if new Date(newsletter.newsletter_date || new Date()) < new Date()}
          <NewsletterMiniPostCard
            label={'Advancement'}
            posts={newsletter.advancement_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Camping'}
            posts={newsletter.camping_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'High Adventure'}
            posts={newsletter.high_adventure_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Fundraisers'}
            posts={newsletter.fundraiser_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Service Opportunities'}
            posts={newsletter.service_mini_posts?.filter(notEmpty) || []}
          />
        {:else}
          <NewsletterMiniPostCard
            label={'Camping'}
            posts={newsletter.camping_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Fundraisers'}
            posts={newsletter.fundraiser_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Service Opportunities'}
            posts={newsletter.service_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'Advancement'}
            posts={newsletter.advancement_mini_posts?.filter(notEmpty) || []}
          />
          <NewsletterMiniPostCard
            label={'High Adventure'}
            posts={newsletter.high_adventure_mini_posts?.filter(notEmpty) || []}
          />
        {/if}
        {#if newsletter.manual_calendar && newsletter.manual_calendar.filter(notEmpty).length > 0}
          <tr>
            <td>
              <table
                width="100%"
                border={1}
                bordercolor="#e0e0e0"
                cellpadding={20}
                style="
                    border: 1px solid rgba(222,222,222,0.7);
                    padding: 20px;
                    width: 100%;
                    background: #ffffff;
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
            <CardTable>
              <tr>
                <td>
                  <ContainerTable>
                    <tr>
                      <ResourceRow label="Troop 370 Website">
                        <p>
                          The Troop 370 website has information about the Troop, useful forms and
                          documents, calendar information, and contact information.
                        </p>
                        <p>Password: sheetbend</p>
                        <a href="https://troop370atlanta.org">Visit our website</a>
                      </ResourceRow>
                      <ResourceRow label="Events & Calendar">
                        <p>
                          View upcoming events and meetings on the Troop website and download the
                          yearly event calendar.
                        </p>
                        <a href="https://troop370atlanta.org/events">Troop Events</a>
                        <a href="https://troop370atlanta.org/members/calendar">Basic Calendar</a>
                      </ResourceRow>
                      {#if new Date(newsletter.newsletter_date || new Date()) < new Date('2022-07-21')}
                        <ResourceRow label="Submit Annoucements">
                          <p>
                            Submit your announcement for the weekly email, website, or reminder
                            text.
                          </p>
                          <p>Please submit your announcement by Sunday at noon.</p>
                          <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSeoqHWwfDjlWDiHeY5EeX_LObkfH8ava_EZrwgWHeVmvKROBw/viewform?embedded=true"
                            >Submit announcement</a
                          >
                        </ResourceRow>
                      {/if}
                    </tr>
                  </ContainerTable>
                </td>
              </tr>
            </CardTable>
          </td>
        </tr>
        <tr>
          <td>
            <CardTable>
              <tr>
                <td>
                  <ContainerTable>
                    <tr>
                      <td width="100%" align="center" valign="top">
                        <p
                          style="
                              font-family: roboto, sans-serif;
                              font-size: 13px;
                              line-height: 1.5;
                              font-weight: 400;
                              margin: 0;
                            "
                        >
                          <a
                            href="https://www.facebook.com/groups/126169727423188/"
                            style="color: #003f87;"
                          >
                            Join us on Facebook
                          </a>
                          <span> • </span>
                          <a href="https://www.instagram.com/bsatroop370/" style="color: #003f87;">
                            Follow us on Instagram
                          </a>
                          <span> • </span>
                          <a href="https://troop370.smugmug.com/" style="color: #003f87;">
                            View Pictures on SmugMug
                          </a>
                        </p>
                      </td>
                    </tr>
                  </ContainerTable>
                </td>
              </tr>
            </CardTable>
          </td>
        </tr>
      </MainTable>
    </BackgroundTable>
  </body>
</html>