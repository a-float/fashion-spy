/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { hydrateRoot } from "react-dom/client";
import App from "./App";
import "@mantine/core/styles.css";

console.log("hydrating with ", window.__INITIAL_DATA__);
hydrateRoot(document, <App {...window.__INITIAL_DATA__} />);
