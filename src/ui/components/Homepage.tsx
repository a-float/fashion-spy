import {
  ActionIcon,
  AppShell,
  Chip,
  Grid,
  Group,
  HoverCard,
  Text,
} from "@mantine/core";
import { useUser } from "ui/hooks/useUser";
import LoginForm from "./LoginForm";
import ItemSearchBar from "./ItemSearchBar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import ItemCard, { ItemCardProps } from "./ItemCard";
import React from "react";
import { IconHelp } from "@tabler/icons-react";
import { fetchItems } from "ui/query";

const storeColors: Record<ItemCardProps["store"], string> = {
  Vinted: "teal",
  Zara: "yellow.7",
  Reserved: "violet.7",
  "H&M": "red.7",
};

const Homepage = () => {
  const { user } = useUser();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => fetchItems(),
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await eden.api.items({ itemId }).delete();
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => itemsQuery.refetch(),
  });

  const [filters, setFilters] = React.useState<string[]>([]);

  const filterChips = (
    <Chip.Group multiple value={filters} onChange={setFilters}>
      {[...new Set(itemsQuery.data?.map((item) => item.store))].map((store) => (
        <Chip
          key={store}
          variant="light"
          value={store}
          color={storeColors[store]}
        >
          {store} (
          {itemsQuery.data?.filter((item) => item.store === store).length})
        </Chip>
      ))}
    </Chip.Group>
  );

  const trackedItemsCount = itemsQuery.data?.filter(
    (item) => item.isTracked
  ).length;

  return (
    <AppShell.Main>
      {!user ? (
        <LoginForm />
      ) : (
        <>
          <ItemSearchBar />
          <Group my="md">
            {filterChips}{" "}
            {trackedItemsCount !== undefined && (
              <Group ml="auto" gap="xs">
                <Text>
                  {`Tracked items: ${trackedItemsCount} / ${user.maxTrackedItems}`}
                </Text>
                <HoverCard width={280} shadow="md">
                  <HoverCard.Target>
                    <ActionIcon
                      aria-label="Tracking info"
                      radius={"md"}
                      variant="transparent"
                      color="light"
                    >
                      <IconHelp stroke={1.3} />
                    </ActionIcon>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size="md">
                      Every user can track only a limited number of items. Only
                      tracked items have their status automatically updated.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>
            )}
          </Group>
          <Grid>
            {itemsQuery.data
              ?.filter(
                (item) => filters.length === 0 || filters.includes(item.store)
              )
              .toSorted((a, d) => d.isTracked - a.isTracked)
              .map((item) => (
                <Grid.Col
                  key={item.id}
                  span={{ base: 6, xs: 4, md: 3, lg: 2.4 }}
                >
                  <ItemCard
                    {...item}
                    handleDelete={deleteItemMutation.mutateAsync}
                  />
                </Grid.Col>
              ))}
          </Grid>
        </>
      )}
    </AppShell.Main>
  );
};

export default Homepage;
