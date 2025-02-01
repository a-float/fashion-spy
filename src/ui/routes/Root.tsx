import { AppShell } from "@mantine/core";
import { Outlet } from "ui/router/router";
import Navbar from "../components/Navbar";

const Root = () => (
  <AppShell header={{ height: 60 }} maw={1440} mx="auto" padding="md">
    <Navbar />
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);

export default Root;
