import { createRoot } from "react-dom/client";
import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource-variable/space-grotesk/index.css";
import "./styles/index.css";
import App from "./App";

history.scrollRestoration = "manual";

createRoot(document.getElementById("root")!).render(<App />);
