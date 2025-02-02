import React from "react";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Box,
  Group,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { Link } from "ui/lib/routing";
import LoggedInUser from "./LoggedInUser";

export const COLOR_SCHEME_COOKIE = "colorScheme";

const Navbar = () => {
  const [cookies, setCookies] = useCookies([COLOR_SCHEME_COOKIE]);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const toggleColorScheme = () => {
    const newValue = computedColorScheme === "dark" ? "light" : "dark";
    setCookies("colorScheme", newValue);
    setColorScheme(newValue);
  };

  React.useEffect(() => {
    if (!cookies.colorScheme) setCookies("colorScheme", computedColorScheme);
  }, []);

  return (
    <AppShell.Header>
      <Group justify="space-between" px="lg" align="center" h="100%">
        <Anchor component={Link} to="/" style={{ textDecoration: "none" }}>
          <Text
            component="h1"
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: "blue", to: "grape", deg: 145 }}
          >
            Fashion Spy
          </Text>
        </Anchor>
        <Box flex="1" />
        <ActionIcon
          onClick={toggleColorScheme}
          c="dimmed"
          variant="transparent"
          size="md"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === "dark" ? (
            <IconSun stroke={1.5} />
          ) : (
            <IconMoon stroke={1.5} />
          )}
        </ActionIcon>
        <LoggedInUser />
      </Group>
    </AppShell.Header>
  );
};

export default Navbar;
