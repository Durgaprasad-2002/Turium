import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ItemPage } from "./components/item-page";
import "./index.css";

const itemId = window.location.hash.match(/^#\/entries\/([\w-]+)$/)?.[1];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {itemId ? <ItemPage id={itemId} /> : <App />}
  </React.StrictMode>,
);
