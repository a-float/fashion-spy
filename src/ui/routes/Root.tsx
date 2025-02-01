import { AppShell } from "@mantine/core";
import { Outlet } from "ui/lib/routing";
import Navbar from "ui/components/Navbar";

const Root = () => (
  <AppShell header={{ height: 60 }} maw={1440} mx="auto" padding="md">
    <Navbar />
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);

export default Root;
