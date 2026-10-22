import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ArtLab from "./views/ArtLab";
import UpdateBar from "./views/UpdateBar";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {location.hash === "#artlab" ? <ArtLab /> : <App />}
    <UpdateBar />
  </StrictMode>,
);
