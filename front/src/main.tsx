import { StrictMode } from "react";
import ReactDOM from 'react-dom';
import App from "./App";

import '@/style/globals.css';

const rootElement = document.getElementById("root");

// New as of React17
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
)
