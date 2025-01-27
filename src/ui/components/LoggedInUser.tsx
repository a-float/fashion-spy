import { Group, Text, Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLock, IconLogout } from "@tabler/icons-react";
import { Link } from "ui/router/router";
import { useUser } from "ui/hooks/useUser";

const LoggedInUser = () => {
  const { user, logoutMutation } = useUser();

  if (!user) return null;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <div>
              <Text size="md" c="dimmed">
                {user.username}
              </Text>
            </div>
            <IconChevronDown size={16} />
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
            logoutMutation.mutate(), history.pushState({}, "", "/");
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default LoggedInUser;
