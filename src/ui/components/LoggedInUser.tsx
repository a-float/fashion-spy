import React from "react";
import { Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLock, IconLogout } from "@tabler/icons-react";
import { useUser } from "ui/hooks/useUser";
import { Link, useRouter } from "ui/lib/routing";

const LoggedInUser = () => {
  const { user, logoutMutation } = useUser();
  const { router } = useRouter();
  const [opened, setOpened] = React.useState(false);

  if (!user) return null;

  return (
    <Menu shadow="md" width={200} opened={opened} onChange={setOpened}>
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
            onClick={() => setOpened(false)}
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
