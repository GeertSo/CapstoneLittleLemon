import React from "react";
import { GlobalStateProvider } from "./GlobalStateProvider";
import { MyNavigation } from "./MyNavigation";

export default function App() {
  return (
    <GlobalStateProvider>
      <MyNavigation />
    </GlobalStateProvider>
  );
}
