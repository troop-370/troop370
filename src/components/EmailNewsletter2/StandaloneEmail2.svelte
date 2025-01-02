<script lang="ts">
  import type { ApiTypes } from '$api';
  import { formatISODate, withoutImageNodes } from '$utils';
  import { blocksToProsemirror } from '$utils/blocksToProsemirror';
  import {
    BackgroundTable,
    CardTable,
    ContainerTable,
    HeaderTable,
    MainTable,
    NewsletterPostCard,
  } from '.';

  export let email: ApiTypes['manualSchemas']['StandaloneEmail'];
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
                          {email.name}
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
                          {#if email.header_date}
                            {formatISODate(email.header_date, false, true, false)}
                          {:else}
                            <code>DATE MISSING</code>
                          {/if}
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
            <NewsletterPostCard body={withoutImageNodes(JSON.parse(email.body || '[]'))} />
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
