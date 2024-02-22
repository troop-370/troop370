async function tryCredentials(
  fetch: Fetch,
  email: string | FormDataEntryValue,
  password: string | FormDataEntryValue
): Promise<[200 | 400 | 401 | 429, ErrorCodes | null, Credentials | null]> {
  const res = await fetch('/admin/strapi/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 405) {
    return [400, 'SERVER_CONNECTION_ERROR', null];
  }

  if (res.status === 429) {
    return [429, 'RATE_LIMIT', null];
  }

  if (res.status === 400) {
    try {
      const json = await res.json();
      if (json.error.message === 'Invalid credentials') return [401, 'INVALID_CREDENTIALS', null];
      return [400, 'UNKNOWN_SERVER_ERROR', null];
    } catch (error) {
      return [400, 'UNKNOWN_SERVER_ERROR', null];
    }
  }

  if (res.status === 200) {
    const credentials = (await res.json())?.data as Credentials;

    const roles = await fetch('/admin/strapi/admin/users/me', {
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    })
      .then((res) => res.json())
      .then(({ data }) => data.roles);

    return [200, null, { token: credentials.token, user: { ...credentials.user, roles } }];
  }

  return [400, 'UNKNOWN_ERROR', null];
}

type Fetch = typeof fetch;

interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  username: string | null;
  email: string;
  isActive: boolean;
  blocked: boolean;
  perferedLanguage: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: Roles[];
}

interface Roles {
  id: number;
  name: string;
  description?: string;
  code: string;
}

interface Credentials {
  token: string;
  user: UserData;
}

type ErrorCodes =
  | 'SERVER_CONNECTION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'UNKNOWN_SERVER_ERROR'
  | 'UNKNOWN_ERROR'
  | 'RATE_LIMIT';

export { tryCredentials };
export type { UserData };
