import React from "react";
import Html from "./components/Html";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Homepage from "./components/Homepage";

const App = (props: AppProps) => {
  console.log("App props", { props });
  const theme = createTheme({});

  return (
    <Html>
      <MantineProvider theme={theme}>
        <QueryClientProvider client={new QueryClient()}>
          <Homepage />
        </QueryClientProvider>
      </MantineProvider>
    </Html>
  );
};

export default App;
