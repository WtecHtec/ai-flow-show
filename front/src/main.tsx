import { StrictMode } from "react";
import ReactDOM from 'react-dom';
import App from "./App";
import { BrowserRouter, HashRouter } from 'react-router-dom';
import '@/style/globals.css';
import 'antd/dist/antd.css';


const rootElement = document.getElementById("root");



// @ts-ignore
// window.VERSION_PLACEHOLDER = '1.1.22';
// New as of React17
ReactDOM.render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
  rootElement
)
