import React from "react";
import { AppShell, Burger, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import LoggedInUser from "../components/LoggedInUser";
import { useUser } from "ui/hooks/useUser";
import LoginForm from "./LoginForm";

const Homepage = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useUser();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group justify="space-between" px="lg" align="center" h="100%">
          <div>Logo</div>
          <LoggedInUser />
        </Group>
      </AppShell.Header>

      {/* <AppShell.Navbar p="md">Navbar</AppShell.Navbar> */}

      <AppShell.Main>{!user && <LoginForm />}</AppShell.Main>
    </AppShell>
  );
};

export default Homepage;
