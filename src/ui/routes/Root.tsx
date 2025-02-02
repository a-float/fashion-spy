import { AppShell } from "@mantine/core";
import Navbar from "ui/components/Navbar";
import { Outlet } from "ui/lib/routing";

const Root = () => (
  <AppShell header={{ height: 60 }} maw={1440} mx="auto" padding="md">
    <Navbar />
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);

export default Root;
