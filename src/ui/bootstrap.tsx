/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { hydrateRoot } from "react-dom/client";
import App, { type AppProps } from "./App";

const appProps = window.__INITIAL_DATA__ as AppProps;

hydrateRoot(document, <App {...appProps} />);
