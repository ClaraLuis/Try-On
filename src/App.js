import React, { useState } from "react";
import "./App.css";
import Bracelet from "./components/Bracelet";
import Ring from "./components/Ring";
import WebcamWithOverlayTops from "./components/WebcamWithOverlayTops";
import WebcamWithOverlayNecklace from "./components/WebcamWithOverlayNecklace";
import WebcamWithOverlayGlasses from "./components/WebcamWithOverlayGlasses";
import WebcamWithEarrings from "./components/WebcamWithEarrings";
import { fetchProductInfo_API } from "./API/API";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import Router from "./components/Router";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Other components can also be included here */}
      <Router />
    </QueryClientProvider>
  );
}

export default App;
