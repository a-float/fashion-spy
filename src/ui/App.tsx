import { StrictMode } from "react";
import { createTheme, MantineProvider, virtualColor } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import Html from "ui/components/Html";
import { COLOR_SCHEME_COOKIE } from "ui/components/Navbar";
import { RouterProvider } from "ui/lib/routing";
import { createAppRouter } from "ui/router";

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

  const defaultColorScheme = props.colorScheme || cookies.colorScheme || "dark";

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
