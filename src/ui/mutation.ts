import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eden } from "./eden";
import { queryKeys } from "./query";
import { startViewTransition } from "./utils/viewTransition";

export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { itemId: number; isTracked: 0 | 1 }) => {
      const res = await eden.api
        .items({ itemId: args.itemId })
        .put({ isTracked: args.isTracked });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () =>
      startViewTransition(() =>
        queryClient.refetchQueries({ queryKey: queryKeys.items })
      ),
    onError: (e) =>
      notifications.show({
        color: "red",
        title: "Item update failed",
        message: e.message,
      }),
  });
};

export const useUpdateStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: number }) => {
      const res = await eden.api.items({ itemId }).updateStatus.post();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.items });
      notifications.show({
        color: "violet.5",
        title: "Success",
        message: "Item status has been updated!",
      });
    },
    onError: (e) => {
      notifications.show({
        color: "red",
        title: "Item status update failed",
        message: e.message,
      });
    },
  });
};

export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId }: { itemId: number }) => {
      const res = await eden.api.items({ itemId }).delete();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.items });
      notifications.show({
        color: "violet.5",
        message: "Item deleted succesfully",
      });
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.items });
      notifications.show({
        title: "Oops",
        color: "red",
        message: "Failed to delete item. Try again later?",
      });
    },
  });
};
