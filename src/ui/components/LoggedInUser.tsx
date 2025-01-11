import React from "react";
import { Group, Avatar, Text, Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLogout, IconSettings } from "@tabler/icons-react";
import { useUser } from "ui/hooks/useUser";

function LoggedInUser() {
  const { user, logoutMutation } = useUser();

  if (!user) return null;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar radius="xl" size="md">
              {user.email[0].toUpperCase()}
            </Avatar>
            <div>
              <Text size="xs" c="dimmed">
                {user.email}
              </Text>
            </div>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<IconSettings size={16} />}>Settings</Menu.Item>
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={() => logoutMutation.mutate()}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default LoggedInUser;
