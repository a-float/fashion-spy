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
  const router = createAppRouter({
    ctx: { queryClient },
    staticLocation: props.location,
  });

  return (
    <StrictMode>
      <Html styleLinks={props.styleLinks}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
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
