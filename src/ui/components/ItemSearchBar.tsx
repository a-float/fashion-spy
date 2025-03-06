import { Button, Group, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eden } from "ui/eden";
import { getFetchStoresOptions, STALE_TIME } from "ui/query";

const ItemSearchBar = () => {
  const form = useForm({
    initialValues: {
      url: "",
    },
    onValuesChange: () => addItemMutation.reset(),
    validate: {
      url: (value) => {
        if (value === "") return null;
        try {
          new URL(value);
          return null;
        } catch {
          return "Invalid item url.";
        }
      },
    },
  });

  const storesQuery = useQuery({
    ...getFetchStoresOptions(),
    staleTime: STALE_TIME,
    placeholderData: [],
    select: (data) =>
      data.filter((store) => !store.isDown).map((store) => store.name),
  });

  const inputDescription = !storesQuery.data?.length
    ? undefined
    : storesQuery.data?.length === 1
    ? `The supported store is ${storesQuery.data[0]}`
    : `The supported stores are ${storesQuery.data
        .slice(0, -1)
        .join(", ")} and ${storesQuery.data.at(-1)}`;

  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (variables: typeof form.values) => {
      const res = await eden.api.items.index.post({ url: variables.url });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  return (
    <Form form={form} onSubmit={(values) => addItemMutation.mutate(values)}>
      <Group align="flex-start">
        <TextInput
          flex={1}
          label="Link to product page"
          description={inputDescription}
          autoComplete="off"
          placeholder="https://your-favourite-online-shop/item/12341"
          required
          {...form.getInputProps("url")}
          error={form.errors.url || addItemMutation.error?.message}
        />
        <Button
          type="submit"
          loading={addItemMutation.isPending}
          variant="gradient"
          gradient={{ from: "blue", to: "grape", deg: 145 }}
          pos="relative"
          top={25}
        >
          Add
        </Button>
      </Group>
    </Form>
  );
};

export default ItemSearchBar;
