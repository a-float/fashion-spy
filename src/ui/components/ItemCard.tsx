import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={`${props.imagePath}`} height={320} alt="" />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>
          {`${lastStatus.amount / 100} ${lastStatus.currency}`}
        </Text>
        <Badge color={color}>{props.store}</Badge>
      </Group>

      <Text size="sm" mb="sm">
        Last checked on:
        <br /> {lastStatus.created_at}
      </Text>

      <Text size="sm" c="dimmed">
        {props.name}
      </Text>

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
