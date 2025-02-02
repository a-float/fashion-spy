import React from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Image,
  LoadingOverlay,
  Menu,
  Overlay,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconEye,
  IconHanger,
  IconHeart,
  IconOutbound,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eden } from "ui/eden";

export type ItemCardProps = NonNullable<
  Awaited<ReturnType<typeof eden.api.items.index.get>>["data"]
>[number] & {
  handleDelete: (itemId: number) => Promise<unknown>;
};

// const storeColors: Record<ItemCardProps["store"], string> = {
//   Vinted: "teal",
//   Zara: "dark",
//   Reserved: "violet.7",
//   "H&M": "red.7",
// };

const PURPLE = "#6c66c3";

const ItemCard = (props: ItemCardProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const lastStatus = props.status.at(-1)!;
  // const color = storeColors[props.store];

  const amountToString = (amount: number): string => {
    if (amount % 100 === 0) return String(amount / 100);
    return (amount / 100).toFixed(2);
  };

  const updateHiddenMutation = useMutation({
    mutationFn: async (body: { isTracked: 0 | 1 }) => {
      const res = await eden.api.items({ itemId: props.id }).put(body);
      if (res.error) throw res.error;
      return res.data;
    },
    // TODO unify delete and update?
    // TODO group queryKeys?
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
    onError: (e) =>
      notifications.show({
        color: "red.5",
        title: "Item update failed",
        message: e.message,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const res = await eden.api
        .items({ itemId: props.id })
        .updateStatus.post();
      if (res.error) throw res.error;
      return res.data;
    },

    // TODO unify delete and update?
    // TODO group queryKeys?
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
    onError: (e) =>
      notifications.show({
        color: "red.5",
        title: "Item status update failed",
        message: e.message,
      }),
  });

  const handleDelete = async () => {
    setLoading(true);
    await props.handleDelete(props.id);
    setLoading(false);
  };

  const toggleHidden = async () =>
    updateHiddenMutation.mutate({
      isTracked: props.isTracked ? 0 : 1,
    });

  const menu = (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          style={{ zIndex: 75 }}
          variant="filled"
          color={PURPLE}
          aria-label="Settings"
          pos={"absolute"}
          right={6}
          top={6}
          radius={"md"}
        >
          <IconHanger stroke={1.3} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Item</Menu.Label>
        <Menu.Item leftSection={<IconEye size={14} />} onClick={toggleHidden}>
          {props.isTracked ? "Pause tracking" : "Resume tracking"}
        </Menu.Item>
        {!!props.isTracked && (
          <Menu.Item
            leftSection={<IconRefresh size={14} />}
            onClick={() => updateStatusMutation.mutate()}
          >
            Update item status
          </Menu.Item>
        )}
        <Menu.Item
          leftSection={<IconOutbound size={14} />}
          component="a"
          href={props.url}
          target="_blank"
        >
          Go to store
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={handleDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <Paper
      radius="md"
      withBorder={!!props.isTracked}
      h="100%"
      pos={"relative"}
      style={{ overflow: "hidden" }}
    >
      <LoadingOverlay
        visible={loading || updateStatusMutation.isPending}
        zIndex={1000}
        loaderProps={{ color: PURPLE }}
        overlayProps={{ blur: 2 }}
      />
      {!props.isTracked ? (
        <Overlay color="#000" backgroundOpacity={0.3} blur={3} zIndex={50}>
          {/* <Text ta="center" mt={150} size={"lg"} c="light">
            Tracking paused
          </Text> */}
        </Overlay>
      ) : null}
      <Flex direction={"column"}>
        <Box h={{ base: 240, xs: 350 }} pos="relative">
          <Image src={props.imagePath} h="100%" alt="" />
          {Object.hasOwn(lastStatus.details, "likes") && (
            <Paper
              pos="absolute"
              bottom={6}
              right={6}
              radius={"md"}
              display={"flex"}
              p={4}
              px={6}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <IconHeart style={{ width: 16 }} />
              <Box ml={4}>{lastStatus.details.likes}</Box>
            </Paper>
          )}
        </Box>
        <Stack gap="0" h="100%" p="md">
          <Flex
            mb="xs"
            gap="0"
            wrap="wrap"
            direction={{ base: "column", xs: "row" }}
            justify={{ base: "flex-start", xs: "space-between" }}
          >
            <Text fw={500} size={"lg"}>
              {lastStatus.amount && lastStatus.currency
                ? `${amountToString(lastStatus.amount)} ${lastStatus.currency}`
                : "Not available"}
            </Text>
            <Badge
              p={0}
              color={"transparent"}
              style={(theme) => ({ color: theme.colors.inverse })}
            >
              {props.store}
            </Badge>
          </Flex>

          <Text size="sm" mb="sm">
            Last checked on:
            <br /> {lastStatus.updatedAt}
          </Text>

          <Text size="sm" c="dimmed" lineClamp={1}>
            {props.name}
          </Text>
          <Space flex={1} />
          {menu}
        </Stack>
      </Flex>
    </Paper>
  );
};

export default ItemCard;
