import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "0px" }}>
        <Outlet /> 
      </div>
    </>
  );
}

export default Home;
