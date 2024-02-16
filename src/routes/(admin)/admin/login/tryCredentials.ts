export async function tryCredentials(
  fetch: Fetch,
  email: string | FormDataEntryValue,
  password: string | FormDataEntryValue
): Promise<
  [
    200 | 400 | 401 | 429,
    (
      | 'SERVER_CONNECTION_ERROR'
      | 'INVALID_CREDENTIALS'
      | 'UNKNOWN_SERVER_ERROR'
      | 'UNKNOWN_ERROR'
      | 'RATE_LIMIT'
      | null
    )
  ]
> {
  const res = await fetch('/admin/strapi/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 405) {
    return [400, 'SERVER_CONNECTION_ERROR'];
  }

  if (res.status === 429) {
    return [429, 'RATE_LIMIT'];
  }

  if (res.status === 400) {
    try {
      const json = await res.json();
      if (json.error.message === 'Invalid credentials') return [401, 'INVALID_CREDENTIALS'];
      return [400, 'UNKNOWN_SERVER_ERROR'];
    } catch (error) {
      return [400, 'UNKNOWN_SERVER_ERROR'];
    }
  }

  if (res.status === 200) {
    return [200, null];
  }

  return [400, 'UNKNOWN_ERROR'];
}

type Fetch = typeof fetch;
