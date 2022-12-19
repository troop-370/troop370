<script lang="ts">
  import MainCarousel from '$components/MailCarousel.svelte';
  import Button, { Label } from '@smui/button';
  import type { PageData } from './$houdini';
  import z from 'zod';
  import PhotoCarousel from '$components/PhotoCarousel.svelte';

  export let data: PageData;
  $: ({ TenantDetails, AnnoucementsConfig } = data);

  const announcementSchema = z
    .object({
      title: z.string().nullable(),
      subtitle: z.string().nullable(),
      href: z.string().nullable(),
      href_text: z.string().nullable(),
    })
    .array();

  $: announcements = (() => {
    if ($AnnoucementsConfig?.data?.webConfigPublic?.config) {
      const res = announcementSchema.safeParse(
        JSON.parse($AnnoucementsConfig.data.webConfigPublic.config)?.cards
      );
      if (res.success) return res.data;
      console.error(res.error);
    }
  })();
</script>

<section class="welcome">
  <div>
    <h1>Welcome to Troop 370</h1>
    <p>
      Troop 370 is proud to have completed over 40 years of consecutive service to the
      Buckhead\Brookhaven community. Sponsored by St. James United Methodist Church, Troop 370 has a
      long history of developing boys into young men following the aims and ideals of the Boy Scouts
      of America movement.
    </p>
    <Button variant="outlined" style="margin-top: 20px;" href="/about">
      <Label>About us</Label>
    </Button>
  </div>
</section>

<section class="carousel">
  <div>
    <MainCarousel announcements={announcements || []} />
  </div>
</section>

<section class="meetings">
  <div>
    <h2>Weekly Meetings</h2>
    <p>
      Wednesday Nights<br />
      7:30 PM - 9:00 PM<br />
      4400 Peachtree Dunwoody Rd, Atlanta, GA 30342<br />
      Activities Building (Loridans Drive Entrance)
    </p>
  </div>
</section>

<section class="photos">
  <div>
    <PhotoCarousel />
  </div>
</section>

<style>
  section.welcome {
    padding-top: 100px;
    padding-bottom: 260px;
    text-align: center;
    background-color: transparent;
    background-image: url(/photos/backgrounds/370-mountains-light.jpg);
    background-position: 50% 57%;
    background-repeat: no-repeat;
    background-size: cover;
  }

  section > div {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
  }

  section.carousel > div {
    padding-left: 0;
    padding-right: 0;
  }

  section.carousel {
    background: linear-gradient(180deg, #c6c6c6 0%, #dedede 51%, white 82%);
  }

  section.meetings {
    text-align: center;
    padding: 40px 0 60px 0;
  }

  section.photos > div {
    padding-left: 0;
    padding-right: 0;
  }

  h1,
  h2 {
    font-family: var(--font-headline);
    font-size: 2.125rem;
    line-height: 2.5rem;
    font-weight: 500;
    letter-spacing: 0.00735294em;
    text-decoration: inherit;
    text-transform: inherit;
    margin-bottom: 10px;
  }

  @media (max-width: 600px) {
    h1,
    h2 {
      font-size: 1.8rem;
    }

    section.welcome {
      padding-top: 10px;
      padding-bottom: 100px;
    }

    section.meetings {
      text-align: center;
      padding-top: 6px;
      padding-bottom: 20px;
    }
  }

  p {
    color: unset;
    border: unset;
    font-family: var(--font-detail);
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.03125em;
    text-decoration: inherit;
    text-transform: inherit;
    margin: 10px 0;
  }
</style>
