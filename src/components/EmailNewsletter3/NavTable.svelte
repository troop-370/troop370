<script lang="ts">
  import type { Newsletter$result } from '$houdini';
  import { ContainerTable } from '.';

  export let newsletter: NonNullable<Newsletter$result['newsletterPublic']>;
</script>

<ContainerTable table$height="8" table$bgcolor="#003f87" table$class="nav-overline" />

<ContainerTable table$height="48" table$bgcolor="#f9f9f9">
  <tr>
    <td style="padding: 0 20px 0 0; height: 48px;">
      <ContainerTable table$height="48">
        <tr>
          <td width="50" align="right" valign="middle">
            <img
              data-imagetype="External"
              src="https://troop370atlanta.org/img/troop370-logo/bugle-logo-512x512.png"
              alt=""
              width={30}
              height={30}
              hspace={0}
              vspace={0}
            />
          </td>
          <td
            style="
              font-family: roboto, sans-serif;
              font-size: 20px;
              font-weight: 500;
              letter-spacing: 0.3px;
              text-align: left;
              padding-left: 20px;
              border-radius: 2px;
            "
          >
            <a
              href="https://troop370atlanta.org"
              style="text-decoration: none; color: #003f87; display: inline-block; height: 40px; line-height: 40px; white-space: nowrap;"
            >
              <span class="hide-380 show-inline-320">BSA </span>Troop 370
            </a>
          </td>
          {@html '<!--[if !mso]><!-->'}
          <td align="right" class="links">
            <a href="https://troop370atlanta.org/posts" class="hide-600">POSTS</a>
            <a href="https://troop370atlanta.org/payments" class="hide-600">PAYMENTS</a>
            <a href="https://troop370atlanta.org/events" class="hide-320">CALENDAR</a>
          </td>
          {@html '<!--<![endif]-->'}
        </tr>
      </ContainerTable>
    </td>
  </tr>
</ContainerTable>

<style>
  .links a {
    font-family: roboto, sans-serif;
    font-size: 16px;
    text-decoration: none;
    color: black;
    font-weight: 500;
    display: inline-block;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    letter-spacing: 0.8px;
    border-radius: 2px;
  }
  @media (max-width: 900px) {
    .links a {
      font-size: 14px;
      padding: 0 8px;
    }
  }

  /* :global(.nav-overline) {
    border-radius: 3px 3px 0 0;
  } */
</style>
