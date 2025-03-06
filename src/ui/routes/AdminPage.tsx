import React from "react";
import {
  Accordion,
  Button,
  Checkbox,
  NumberInput,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eden } from "ui/eden";
import { useUser } from "ui/hooks/useUser";
import {
  getFetchStoresOptions,
  getFetchUsersOptions,
  queryKeys,
  STALE_TIME,
} from "ui/query";

type User = NonNullable<
  Awaited<ReturnType<typeof eden.api.users.get>>["data"]
>[number];

const AdminTableUserRow = ({ user }: { user: User }) => {
  const form = useForm({
    initialValues: {
      isAdmin: user.isAdmin === 1,
      isActive: user.isActive === 1,
      maxTrackedItems: user.maxTrackedItems,
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      await eden.api.users({ id: user.id }).put({
        ...values,
        isAdmin: Number(values.isAdmin),
        isActive: Number(values.isActive),
      });
    },
    onSuccess: () => {
      form.setInitialValues(form.values);
      form.reset();
      notifications.show({
        title: "Success",
        color: "violet.5",
        message: "User has been updated successfully",
      });
    },
  });

  return (
    <Table.Tr key={user.id}>
      <Table.Td>{user.username}</Table.Td>
      <Table.Td>
        <Checkbox
          {...form.getInputProps("isAdmin")}
          checked={form.values.isAdmin}
        />
      </Table.Td>
      <Table.Td>
        <Checkbox
          {...form.getInputProps("isActive")}
          checked={form.values.isActive}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          {...form.getInputProps("maxTrackedItems")}
          maw={"14ch"}
          min={1}
          max={100}
          step={1}
        />
      </Table.Td>
      <Table.Td>{user.createdAt}</Table.Td>
      <Table.Td>
        <Button
          variant="light"
          disabled={!form.isDirty()}
          onClick={() => updateUserMutation.mutate(form.values)}
          loading={updateUserMutation.isPending}
        >
          Update
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

type Store = NonNullable<
  Awaited<ReturnType<typeof eden.api.stores.index.get>>["data"]
>[number];

const AdminTableStoreRow = ({ store }: { store: Store }) => {
  const [isDown, setIsDown] = React.useState(store.isDown);
  const queryClient = useQueryClient();
  const updateStoreMutation = useMutation({
    mutationFn: async () => {
      await eden.api.stores.index.put({
        name: store.name,
        isDown: isDown,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores });
      notifications.show({
        title: "Success",
        color: "violet.5",
        message: "Store status has been updated successfully",
      });
    },
  });

  return (
    <Table.Tr>
      <Table.Td>{store.name}</Table.Td>
      <Table.Td>
        <Checkbox
          checked={!isDown}
          onChange={(e) => setIsDown(!e.target.checked)}
        />
      </Table.Td>
      <Table.Td>
        <Button
          variant="light"
          disabled={isDown === store.isDown}
          loading={updateStoreMutation.isPending}
          onClick={() => updateStoreMutation.mutate()}
        >
          Update
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

const AdminPage = () => {
  const { user } = useUser();
  const userQuery = useQuery({
    ...getFetchUsersOptions(),
    enabled: !!user?.isAdmin,
    staleTime: STALE_TIME,
  });

  const storesQuery = useQuery({
    ...getFetchStoresOptions(),
    enabled: !!user?.isAdmin,
    staleTime: STALE_TIME,
  });

  if (!user?.isAdmin) return "Unauthorized";
  if (!userQuery.data) return null;
  if (!storesQuery.data) return null;
  return (
    <Accordion multiple>
      <Accordion.Item value="stores">
        <Accordion.Control icon="🏪">
          <Title order={2} size="h3" my="sm">
            Store management
          </Title>
        </Accordion.Control>
        <Accordion.Panel>
          <Table maw="30rem">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Store name</Table.Th>
                <Table.Th>isActive</Table.Th>
                <Table.Th w={0}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {storesQuery.data.map((store) => (
                <AdminTableStoreRow key={store.name} store={store} />
              ))}
            </Table.Tbody>
          </Table>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="users">
        <Accordion.Control icon="🙆‍♂️">
          <Title order={2} size="h3" my="sm">
            User management
          </Title>
        </Accordion.Control>
        <Accordion.Panel>
          <ScrollArea>
            <Table miw={550} maw={1200}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>isAdmin</Table.Th>
                  <Table.Th>isActive</Table.Th>
                  <Table.Th>Max Items</Table.Th>
                  <Table.Th>Created At</Table.Th>
                  <Table.Th w={0}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {userQuery.data.map((user) => (
                  <AdminTableUserRow key={user.id} user={user} />
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default AdminPage;
