import React, { PropsWithChildren, useState } from "react";
import Navbar from "~/components/landing-page/Navbar"; // Import your Sidebar component
import Sidebar from "~/components/landing-page/Sidebar"; // Import your Sidebar component

const Layout = ({ children }: PropsWithChildren) => {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <div className="grid min-h-screen grid-rows-header bg-zinc-100">
      <div className="bg-white shadow-sm z-10">
        <Navbar onMenuButtonClick={() => setShowSidebar((prev) => !prev)} />
      </div>
      <div className="bg-white shadow-sm z-10">
        <Sidebar />
      </div>

      <div className="grid md:grid-cols-sidebar ">
        <div className="shadow-md bg-zinc-50">Sidebar</div>
        {children}
      </div>
    </div>
  );
};

export default Layout;
