import { Group, Text, Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
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
                {user.email.split("@")[0]}
              </Text>
            </div>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
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
};

export default LoggedInUser;
