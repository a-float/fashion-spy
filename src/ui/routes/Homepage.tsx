import React from "react";
import { ActionIcon, Chip, Grid, Group, HoverCard, Text } from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import ItemCard, { ItemCardProps } from "ui/components/ItemCard";
import ItemSearchBar from "ui/components/ItemSearchBar";
import LoginForm from "ui/components/LoginForm";
import { eden } from "ui/eden";
import { useUser } from "ui/hooks/useUser";
import { getFetchItemsOptions, STALE_TIME } from "ui/query";
import { startViewTransition } from "ui/utils/viewTransition";

const storeColors: Record<ItemCardProps["store"], string> = {
  Vinted: "teal",
  Zara: "yellow.7",
  Reserved: "violet.7",
  "H&M": "red.7",
};

const Homepage = () => {
  const { user } = useUser();

  const itemsQuery = useQuery({
    ...getFetchItemsOptions(),
    enabled: !!user,
    staleTime: STALE_TIME,
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
    <Chip.Group
      multiple
      value={filters}
      onChange={(value) => {
        console.log("Changing to ", value);
        startViewTransition(() => flushSync(() => setFilters(value)));
      }}
    >
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

  return !user ? (
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
            <Grid.Col key={item.id} span={{ base: 6, xs: 4, md: 3, lg: 2.4 }}>
              <ItemCard
                {...item}
                handleDelete={deleteItemMutation.mutateAsync}
              />
            </Grid.Col>
          ))}
      </Grid>
    </>
  );
};

export default Homepage;
