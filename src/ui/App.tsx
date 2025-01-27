import {
  AppShell,
  createTheme,
  MantineProvider,
  useProps,
  virtualColor,
} from "@mantine/core";
import Html from "./components/Html";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import { Notifications } from "@mantine/notifications";
import { StrictMode } from "react";
import { RouterProvider } from "ui/router/router";
import { createAppRouter } from "./router/appRouter";

export type AppProps = {
  styleLinks: string[];
  dehydratedState: DehydratedState;
  location?: string;
};

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

  const queryClient = new QueryClient();
  const router = createAppRouter();
  if (props.location) router.ssrLocation = props.location;

  return (
    <StrictMode>
      <Html styleLinks={props.styleLinks}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={props.dehydratedState}>
              <AppShell
                header={{ height: 60 }}
                maw={1440}
                mx="auto"
                padding="md"
              >
                <Navbar />
                <RouterProvider router={router} />
              </AppShell>
            </HydrationBoundary>
          </QueryClientProvider>
        </MantineProvider>
      </Html>
    </StrictMode>
  );
};

export default App;
