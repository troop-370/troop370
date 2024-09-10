import { VAULT_LOGINS } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const { session } = await parent();

  // get the user roles for the currently authenticated user
  const userRoles = session.adminUser?.roles?.map((role) => role.name);
  if (!userRoles) error(403);

  // get the accounts
  const accounts = JSON.parse(VAULT_LOGINS || '[]') as VaultLogin[];

  // filter accounts to only include accounts that the user has access to
  const filteredAccounts = accounts.filter((account) => {
    const rolesForAccount = (account.tags || []).map((tag) => tag.replace('Role::', ''));
    return userRoles.some((role) => rolesForAccount.includes(role));
  });

  return {
    accounts: filteredAccounts,
  };
}) satisfies PageServerLoad;

export interface VaultLogin {
  username: string;
  password: string;
  mfa?: { secret: string; period?: number; digits?: number }[];
  name?: string;
  website?: string;
  tags?: string[];
}
