import React, { ReactNode, Suspense } from "react";
import Navigation from "@/app/components/Navigation";
import Loading from "./Loading";

interface LayoutProps {
    children: ReactNode;
}

const CustomLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
      <div>
        <Suspense fallback={<Loading />}>
          <Navigation />
          <main className="pt-32">
              {children}
          </main>
        </Suspense>
      </div>
    );
  };
  
  export default CustomLayout;