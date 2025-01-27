/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { hydrateRoot } from "react-dom/client";
import App, { type AppProps } from "./App";

const appProps = window.__INITIAL_DATA__ as AppProps;
console.log({ appProps });

hydrateRoot(document, <App {...appProps} />);
