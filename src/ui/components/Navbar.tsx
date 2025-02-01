import {
  ActionIcon,
  AppShell,
  Text,
  Box,
  Group,
  useComputedColorScheme,
  useMantineColorScheme,
  Anchor,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import LoggedInUser from "./LoggedInUser";
import { Link } from "ui/lib/routing";
import { useCookies } from "react-cookie";

export const COLOR_SCHEME_COOKIE = "colorScheme";

const Navbar = () => {
  const [, setCookies] = useCookies([COLOR_SCHEME_COOKIE]);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const toggleColorScheme = () => {
    const newValue = computedColorScheme === "dark" ? "light" : "dark";
    setCookies("colorScheme", newValue);
    setColorScheme(newValue);
  };

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
