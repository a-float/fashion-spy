import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import { fetchProfile } from "ui/query";

export function useUser() {
  const userQuery = useQuery({
    queryKey: ["user"],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: () => fetchProfile(),
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
    mutationFn: async () => await eden.api.logout.get(),
    onSuccess: () => userQuery.refetch(),
  });

  const signUpMutation = useMutation({
    mutationFn: async (
      variables: Parameters<typeof eden.api.signup.post>["0"]
    ) => {
      const res = await eden.api.signup.post(variables);
      if (res.error) throw res.error;
      return res.data;
    },
  });

  return {
    user: userQuery.data || null,
    loginMutation,
    logoutMutation,
    signUpMutation,
  };
}
