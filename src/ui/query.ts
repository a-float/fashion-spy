import { eden } from "./eden";

const getAuthHeader = (token?: string) =>
  token ? ([["Cookie", `token=${token}`]] as [string, string][]) : undefined;

export const fetchProfile = async (token?: string) => {
  const res = await eden.api.profile.get({
    fetch: { headers: getAuthHeader(token) },
  });
  if (res.error) throw res.error;
  return res.data;
};

export const fetchItems = async (token?: string) => {
  const res = await eden.api.items.index.get({
    fetch: { headers: getAuthHeader(token) },
  });
  if (res.error) throw res.error;
  return res.data;
};

export const fetchUsers = async () => {
  const res = await eden.api.users.get();
  if (res.error) throw res.error;
  return res.data;
};
