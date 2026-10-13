import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "@fontsource-variable/dm-sans";
import { getRouter } from "./router";

const router = getRouter();

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
