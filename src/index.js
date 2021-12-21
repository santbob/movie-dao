import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";

// Import thirdweb
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

// include the chain you want to deploy in
// 4 for rinkeby
const supportedChainIds = [4];

// include what type of wallet you want to support
// In this case, we support metamask which is an "inject wallet"
const connectors = {
  injected: {},
};


// Render the App component to the DOM
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <div className="landing">
        <App />
      </div>
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
