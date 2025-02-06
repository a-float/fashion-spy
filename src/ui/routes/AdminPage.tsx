import {
  Button,
  Checkbox,
  NumberInput,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { eden } from "ui/eden";
import { useUser } from "ui/hooks/useUser";
import { getFetchUsersOptions, STALE_TIME } from "ui/query";

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

const AdminPage = () => {
  const { user } = useUser();
  const userQuery = useQuery({
    ...getFetchUsersOptions(),
    enabled: !!user?.isAdmin,
    staleTime: STALE_TIME,
  });

  if (!user?.isAdmin) return "Unauthorized";
  if (!userQuery.data) return null;
  return (
    <>
      <Title order={2} size="h3" my={"md"}>
        User management
      </Title>
      <ScrollArea>
        <Table style={{ minWidth: 550 }} mb="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>isAdmin</Table.Th>
              <Table.Th>isActive</Table.Th>
              <Table.Th>Max Items</Table.Th>
              <Table.Th>Created At</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {userQuery.data.map((user) => (
              <AdminTableUserRow key={user.id} user={user} />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
};

export default AdminPage;
