import { error, type Load } from '@sveltejs/kit';
import z from 'zod';
import type { Actions } from './$types';

export const load: Load = async ({ parent }) => {
  const { session } = await parent();
  const accessToken = session.constantContactAccessToken;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const contactListOptions = await fetch(
    'https://api.cc.email/v3/contact_lists?limit=50&include_count=true',
    { headers }
  )
    .then(async (res) => {
      const validator = z.object({
        lists: z
          .object({
            list_id: z.string(),
            name: z.string(),
            favorite: z.boolean(),
            created_at: z.string(),
            updated_at: z.string(),
            membership_count: z.number(),
          })
          .array(),
        lists_count: z.number(),
      });

      const json = await res.json();
      const data = validator.parse(json);

      return data.lists
        .map((list) => {
          return {
            label: list.favorite ? `${list.name} ★` : list.name,
            value: list.list_id,
            favorite: list.favorite,
            checked: false,
          };
        })
        .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
        .sort((a, b) => (a.favorite && !b.favorite ? -1 : 1));
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  const accountEmails = await fetch(
    'https://api.cc.email/v3/account/emails?confirm_status=CONFIRMED',
    { headers }
  )
    .then(async (res) => {
      const validator = z
        .object({
          email_id: z.number(),
          email_address: z.string(),
          roles: z.string().array(),
        })
        .array();

      const json = await res.json();
      const data = validator.parse(json);

      return data
        .map((v) => v.email_address)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .sort((a, b) =>
          a.includes('@troop370atlanta.org') && !b.includes('@troop370atlanta.org') ? -1 : 1
        )
        .sort((a) => (a === 'sheribuehner@gmail.com' ? -1 : 1));
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  return { contactListOptions, accountEmails };
};

const validator = z.object({
  subject: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),
  replyEmail: z.string(),
  body: z.string(),
  lists: z.string().array(),
});

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const formData = await request.formData();
    const json = {
      subject: formData.get('subject')?.toString(),
      senderName: formData.get('senderName')?.toString(),
      senderEmail: formData.get('senderEmail')?.toString(),
      replyEmail: formData.get('replyEmail')?.toString(),
      body: formData.get('body')?.toString(),
      lists: formData.get('lists')?.toString().split(','),
    };

    const data = validator.parse(json);

    const accessToken = locals.session.data.constantContactAccessToken;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    // create the email to send
    const result = await fetch('https://api.cc.email/v3/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: data.subject + ' [' + new Date().toISOString() + ']',
        email_campaign_activities: [
          {
            format_type: 5,
            from_email: data.senderEmail,
            reply_to_email: data.replyEmail,
            from_name: data.senderName,
            subject: data.subject,
            html_content: data.body,
            preheader: '',
            physical_address_in_footer: {
              address_line1: '4400 Peachtree Dunwoody Road',
              city: 'Atlanta',
              country_code: 'US',
              country_name: 'United States',
              organization_name: 'Scouts BSA Troop 370',
              postal_code: '30342',
              state_code: 'GA',
            },
          },
        ],
      }),
    })
      .then(async (res) => {
        const json = await res.json();

        const campaign_activity_id = json.campaign_activities[0].campaign_activity_id;
        const campaign_id = json.campaign_id;
        const role = json.campaign_activities[0].role;

        // include the lists to send
        return await fetch(`https://api.cc.email/v3/emails/activities/${campaign_activity_id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            campaign_activity_id,
            campaign_id,
            role,
            from_email: data.senderEmail,
            reply_to_email: data.replyEmail,
            from_name: data.senderName,
            subject: data.subject,
            contact_list_ids: data.lists,
          }),
        }).then(async () => {
          // schedule to send immediately
          return await fetch(
            `https://api.cc.email/v3/emails/activities/${campaign_activity_id}/schedules`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({ scheduled_date: 0 }),
            }
          ).then(() => {
            return {
              campaign_activity_id,
              campaign_id,
              role,
            };
          });
        });
      })
      .catch((err) => {
        console.error(err);
        throw error(400);
      });

    return `https://app.constantcontact.com/pages/campaigns/email-details/reporting/activity/${result.campaign_activity_id}`;
  },
};
