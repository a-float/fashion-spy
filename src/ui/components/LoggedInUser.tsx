import { Group, Text, Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLock, IconLogout } from "@tabler/icons-react";
import { Link, useRouter } from "ui/lib/routing";
import { useUser } from "ui/hooks/useUser";

const LoggedInUser = () => {
  const { user, logoutMutation } = useUser();
  const { router } = useRouter();

  if (!user) return null;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group c="dimmed" gap="4">
            <Text size="md">{user.username}</Text>
            <IconChevronDown
              size={16}
              style={{ position: "relative", top: 2 }}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {!!user.isAdmin && (
          <Menu.Item
            component={Link}
            to="/admin"
            leftSection={<IconLock size={16} />}
          >
            Admin panel
          </Menu.Item>
        )}
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={() => {
            logoutMutation.mutate();
            router.navigate("/");
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default LoggedInUser;
