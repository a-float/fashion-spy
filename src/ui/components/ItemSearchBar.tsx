import { Button, Group, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eden } from "ui/eden";

const ItemSearchBar = () => {
  const form = useForm({
    initialValues: {
      url: "",
    },
    validate: {
      url: (value) => (value.length > 0 ? null : "Required"),
    },
  });

  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (variables: typeof form.values) => {
      await eden.api.items.index.post({ url: variables.url });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  return (
    <Form form={form} onSubmit={(values) => addItemMutation.mutate(values)}>
      <Group align="flex-end">
        <TextInput
          flex={1}
          label="Item url"
          placeholder="https://yout-favourite-online-shop/item/12341"
          required
          {...form.getInputProps("url")}
        />
        <Button
          type="submit"
          disabled={!form.isValid()}
          loading={addItemMutation.isPending}
        >
          Add
        </Button>
      </Group>
    </Form>
  );
};

export default ItemSearchBar;
