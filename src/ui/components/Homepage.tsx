import { AppShell, Grid, Space } from "@mantine/core";
import { useUser } from "ui/hooks/useUser";
import LoginForm from "./LoginForm";
import ItemSearchBar from "./ItemSearchBar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import ItemCard from "./ItemCard";

const Homepage = () => {
  const { user } = useUser();

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
    <AppShell.Main>
      {!user ? (
        <LoginForm />
      ) : (
        <>
          <ItemSearchBar />
          <Space h="md" />
          <Grid>
            {itemsQuery.data?.map((item) => (
              <Grid.Col key={item.id} span={{ base: 6, xs: 4, md: 3, lg: 2.4 }}>
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
