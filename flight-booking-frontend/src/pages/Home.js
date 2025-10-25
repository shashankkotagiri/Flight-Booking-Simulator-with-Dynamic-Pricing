import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "0px" }}>
        <Outlet /> {/* 👈 Nested content will appear here */}
      </div>
    </>
  );
}

export default Home;
