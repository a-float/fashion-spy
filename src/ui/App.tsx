import Html from "./components/Html";
import {
  AppShell,
  createTheme,
  MantineProvider,
  virtualColor,
} from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Homepage from "./components/Homepage";
import Navbar from "./components/Navbar";
import { Route, Routes, StaticRouter } from "react-router";
import AdminPage from "./components/AdminPage";
import { Notifications } from "@mantine/notifications";

const App = (props: AppProps) => {
  console.log("App props", { props });
  const theme = createTheme({
    colors: {
      inverse: virtualColor({
        name: "inverse",
        dark: "white",
        light: "dark",
      }),
    },
  });

  return (
    <Html>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <QueryClientProvider client={new QueryClient()}>
          <AppShell header={{ height: 60 }} maw={1440} mx="auto" padding="md">
            <Navbar />
            <StaticRouter location={props.location}>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </StaticRouter>
          </AppShell>
        </QueryClientProvider>
      </MantineProvider>
    </Html>
  );
};

export default App;
