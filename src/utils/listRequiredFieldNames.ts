const extraFieldNames: Record<string, Record<string, string[]>> = {
  'email.announcements-v3': {
    pinned_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    announcements: ['title', 'subtitle', 'body', 'submitted_by'],
    past_announcements: ['title', 'subtitle', 'button_text', 'slug'],
  },
  'email.announcements-v2': {
    pinned_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    posts: ['title', 'subtitle', 'body', 'submitted_by'],
    advancement_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    fundraiser_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    camping_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    service_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
    high_adventure_mini_posts: ['title', 'subtitle', 'button_text', 'slug'],
  },
};

export function listExtraFieldNames(collection: string, field: string): string[] {
  return extraFieldNames[collection]?.[field] || [];
}
