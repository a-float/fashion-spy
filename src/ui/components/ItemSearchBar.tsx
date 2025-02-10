import { Button, Group, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eden } from "ui/eden";

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

  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (variables: typeof form.values) => {
      const res = await eden.api.items.index.post({ url: variables.url });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      form.reset();
      queryClient.refetchQueries({ queryKey: ["items"] });
    },
  });

  return (
    <Form form={form} onSubmit={(values) => addItemMutation.mutate(values)}>
      <Group align="flex-start">
        <TextInput
          flex={1}
          label="Item url"
          autoComplete="off"
          placeholder="https://yout-favourite-online-shop/item/12341"
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
