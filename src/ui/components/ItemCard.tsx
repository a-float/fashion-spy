import { Badge, Button, Card, Group, Image, Space, Text } from "@mantine/core";
import React from "react";
import { eden } from "ui/eden";

type ItemCardProps = NonNullable<
  Awaited<ReturnType<typeof eden.api.item.index.get>>["data"]
>[number] & {
  handleDelete: (itemId: number) => Promise<void>;
};

const ItemCard = (props: ItemCardProps) => {
  const [loading, setLoading] = React.useState(false);
  const lastStatus = props.status.at(-1)!;
  const color = props.store === "Vinted" ? "teal" : "dark";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Card.Section>
        <Image src={`${props.imagePath}`} height={320} alt="" />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>
          {lastStatus.amount && lastStatus.currency
            ? `${lastStatus.amount / 100} ${lastStatus.currency}`
            : "Not available"}
        </Text>
        <Badge color={color}>{props.store}</Badge>
      </Group>

      <Text size="sm" mb="sm">
        Last checked on:
        <br /> {lastStatus.created_at}
      </Text>

      <Text size="sm" c="dimmed" lineClamp={3}>
        {props.name}
      </Text>
      <Space display="flex" flex={1} />

      <Group justify="space-between">
        <Button
          color="red"
          variant="subtle"
          mt="md"
          radius="md"
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await props.handleDelete(props.id);
            setLoading(false);
          }}
        >
          Delete
        </Button>
        <Button component="a" color="blue" mt="md" radius="md" href={props.url}>
          View
        </Button>
      </Group>
    </Card>
  );
};

export default ItemCard;
