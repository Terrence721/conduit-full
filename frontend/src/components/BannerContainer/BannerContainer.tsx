import type { ReactNode } from "react";

interface BannerContainerProps {
  children: ReactNode;
}

function BannerContainer({ children }: BannerContainerProps) {
  return (
    <div className="banner">
      <div className="container">{children}</div>
    </div>
  );
}

export default BannerContainer;
