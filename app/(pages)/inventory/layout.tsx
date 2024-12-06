import React, { ReactNode } from "react";
import Navigation from "@/app/components/Navigation";

interface LayoutProps {
    children: ReactNode;
}

const CustomLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
      <div>
        <Navigation />
        <main className="pt-32">
            {children}
        </main>
      </div>
    );
  };
  
  export default CustomLayout;