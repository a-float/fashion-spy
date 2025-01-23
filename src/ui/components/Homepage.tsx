import {
  ActionIcon,
  AppShell,
  Box,
  Grid,
  Group,
  Space,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import LoggedInUser from "../components/LoggedInUser";
import { useUser } from "ui/hooks/useUser";
import LoginForm from "./LoginForm";
import ItemSearchBar from "./ItemSearchBar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import ItemCard from "./ItemCard";
import { IconSun, IconMoon } from "@tabler/icons-react";

const Homepage = () => {
  const { user } = useUser();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await eden.api.item.index.get();
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await eden.api.item({ itemId }).delete();
    },
    onSuccess: () => itemsQuery.refetch(),
  });

  return (
    <AppShell header={{ height: 60 }} maw={1440} mx="auto" padding="md">
      <AppShell.Header>
        <Group justify="space-between" px="lg" align="center" h="100%">
          <Text
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: "blue", to: "grape", deg: 145 }}
          >
            Fashion Spy
          </Text>
          <Box flex="1" />
          <ActionIcon
            onClick={toggleColorScheme}
            color="gray"
            variant="transparent"
            size="md"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "dark" ? (
              <IconSun stroke={1.5} />
            ) : (
              <IconMoon stroke={1.5} />
            )}
          </ActionIcon>
          <LoggedInUser />
        </Group>
      </AppShell.Header>

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
    </AppShell>
  );
};

export default Homepage;
