import { createTheme, MantineProvider, virtualColor } from "@mantine/core";
import Html from "./components/Html";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { StrictMode } from "react";
import { RouterProvider } from "ui/router/router";
import { createAppRouter } from "./router/appRouter";
import { useCookies } from "react-cookie";
import { COLOR_SCHEME_COOKIE } from "./components/Navbar";

export type AppProps = {
  styleLinks: string[];
  dehydratedState: DehydratedState;
  colorScheme?: "light" | "dark" | (string & {});
  location?: string;
};

const App = (props: AppProps) => {
  const [cookies] = useCookies([COLOR_SCHEME_COOKIE]);
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
  const router = createAppRouter({
    ctx: { queryClient },
    staticLocation: props.location,
  });

  const defaultColorScheme = props.colorScheme || cookies.colorScheme;

  return (
    <StrictMode>
      <Html styleLinks={props.styleLinks} colorScheme={defaultColorScheme}>
        <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
          <Notifications />
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={props.dehydratedState}>
              <RouterProvider router={router} staticPathname={props.location} />
            </HydrationBoundary>
          </QueryClientProvider>
        </MantineProvider>
      </Html>
    </StrictMode>
  );
};

export default App;
