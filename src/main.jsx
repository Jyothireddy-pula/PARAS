import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import store from "./store.js";
import "./index.css";
import MapProvider from "./MapProvider.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <MapProvider>
      <App />
      <ToastContainer position="top-center" autoClose={1000} />
    </MapProvider>
  </Provider>
);
