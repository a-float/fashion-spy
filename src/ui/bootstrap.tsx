/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { hydrateRoot } from "react-dom/client";
import App from "./App";
import "@mantine/core/styles.css";

hydrateRoot(document, <App {...window.__INITIAL_DATA__} />);
