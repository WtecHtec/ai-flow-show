import { StrictMode } from "react";
import ReactDOM from 'react-dom';
import App from "./App";
import { BrowserRouter } from 'react-router-dom';
import '@/style/globals.css';

const rootElement = document.getElementById("root");
// @ts-ignore
// window.VERSION_PLACEHOLDER = '1.1.22';
// New as of React17
ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
  rootElement
)
