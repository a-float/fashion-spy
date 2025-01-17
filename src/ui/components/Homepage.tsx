import React from "react";
import { AppShell, Burger, Button, Grid, Group, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import LoggedInUser from "../components/LoggedInUser";
import { useUser } from "ui/hooks/useUser";
import LoginForm from "./LoginForm";
import ItemSearchBar from "./ItemSearchBar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import ItemCard from "./ItemCard";

const Homepage = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useUser();

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await eden.api.items.index.get();
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await eden.api.items.index.delete({ itemId });
    },
    onSuccess: () => itemsQuery.refetch(),
  });

  return (
    <AppShell
      header={{ height: 60 }}
      // navbar={{
      //   width: 300,
      //   breakpoint: "sm",
      //   collapsed: { mobile: !opened },
      // }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group justify="space-between" px="lg" align="center" h="100%">
          <div>Logo</div>
          <LoggedInUser />
        </Group>
      </AppShell.Header>

      {/* <AppShell.Navbar p="md">Navbar</AppShell.Navbar> */}

      <AppShell.Main>
        {!user ? (
          <LoginForm />
        ) : (
          <>
            <ItemSearchBar />
            <Space h="md" />
            <Grid>
              {itemsQuery.data?.map((item) => (
                <Grid.Col
                  key={item.id}
                  span={{ base: 12, xs: 6, md: 4, lg: 3 }}
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
    </AppShell>
  );
};

export default Homepage;
