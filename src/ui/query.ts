import { QueryKey } from "@tanstack/react-query";
import { eden } from "./eden";

export const STALE_TIME = 30 * 1000;

const getAuthHeader = (token?: string) =>
  token ? ([["Cookie", `token=${token}`]] as [string, string][]) : [];

export const queryKeys = {
  profile: ["user"],
  users: ["users"],
  items: ["items"],
  stores: ["stores"],
} as const satisfies Record<string, QueryKey>;

export const getFetchProfileOptions = (token?: string) =>
  ({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await eden.api.profile.get({
        fetch: { headers: getAuthHeader(token) },
      });
      if (res.error) throw res.error;
      return res.data;
    },
  } as const);

export const getFetchUsersOptions = (token?: string) =>
  ({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const res = await eden.api.users.get({
        fetch: { headers: getAuthHeader(token) },
      });
      if (res.error) throw res.error;
      return res.data;
    },
  } as const);

export const getFetchStoresOptions = (token?: string) =>
  ({
    queryKey: queryKeys.stores,
    queryFn: async () => {
      const res = await eden.api.stores.index.get({
        fetch: { headers: getAuthHeader(token) },
      });
      if (res.error) throw res.error;
      return res.data;
    },
  } as const);

export const getFetchItemsOptions = (token?: string) =>
  ({
    queryKey: queryKeys.items,
    queryFn: async () => {
      const res = await eden.api.items.index.get({
        fetch: { headers: getAuthHeader(token) },
      });
      if (res.error) throw res.error;
      return res.data;
    },
  } as const);
