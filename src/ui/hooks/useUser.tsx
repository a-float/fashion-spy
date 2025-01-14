import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";

export function useUser() {
  const userQuery = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await eden.api.profile.get();
      if (res.error) throw res.error;
      return res.data;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (
      variables: Parameters<typeof eden.api.login.post>["0"]
    ) => {
      const res = await eden.api.login.post(variables);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => userQuery.refetch(),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => await eden.api.logout.post(),
    onSuccess: () => userQuery.refetch(),
  });

  const signUpMutation = useMutation({
    mutationFn: async (
      variables: Parameters<typeof eden.api.signup.post>["0"]
    ) => {
      await eden.api.signup.post(variables);
    },
  });

  return {
    user: userQuery.data || null,
    loginMutation,
    logoutMutation,
    signUpMutation,
  };
}
