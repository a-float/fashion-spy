import React from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Image,
  LoadingOverlay,
  Menu,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconTrash,
  IconChartHistogram,
  IconOutbound,
  IconEye,
  IconHanger,
} from "@tabler/icons-react";
import { eden } from "ui/eden";

type ItemCardProps = NonNullable<
  Awaited<ReturnType<typeof eden.api.item.index.get>>["data"]
>[number] & {
  handleDelete: (itemId: number) => Promise<void>;
};

// const storeColors: Record<ItemCardProps["store"], string> = {
//   Vinted: "teal",
//   Zara: "dark",
//   Reserved: "violet.7",
//   "H&M": "red.7",
// };

const ItemCard = (props: ItemCardProps) => {
  const [loading, setLoading] = React.useState(false);
  const lastStatus = props.status.at(-1)!;
  // const color = storeColors[props.store];

  const amountToString = (amount: number): string => {
    if (amount % 100 === 0) return String(amount / 100);
    return (amount / 100).toFixed(2);
  };

  const handleDelete = async () => {
    setLoading(true);
    await props.handleDelete(props.id);
    setLoading(false);
  };

  const menu = (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          variant="filled"
          color="#6c66c3"
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
        <Menu.Label>Ciuszek</Menu.Label>
        <Menu.Item
          leftSection={<IconOutbound size={14} />}
          component="a"
          href={props.url}
          target="_blank"
        >
          Go to store
        </Menu.Item>
        <Menu.Item leftSection={<IconEye size={14} />}>
          {props.hidden ? "Resume tracking" : "Pause tracking"}
        </Menu.Item>
        <Menu.Item leftSection={<IconChartHistogram size={14} />}>
          View history
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
      shadow="sm"
      radius="md"
      withBorder
      h="100%"
      pos={"relative"}
      style={{ overflow: "hidden" }}
    >
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ blur: 2 }}
      />
      <Flex direction={"column"}>
        <Box h={{ base: 240, xs: 350 }}>
          <Image src={props.imagePath} h="100%" alt="" />
        </Box>
        <Stack gap="0" h="100%" p="md">
          <Flex
            justify="space-between"
            mb="xs"
            gap="0"
            wrap="wrap"
            align="center"
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
            <br /> {lastStatus.created_at}
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
