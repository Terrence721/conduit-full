import type { ReactNode } from "react";

interface ContainerRowProps {
  children: ReactNode;
  type?: "page";
}

function ContainerRow({ children, type }: ContainerRowProps) {
  return (
    <div className={`container ${type || ""}`}>
      <div className="row">{children}</div>
    </div>
  );
}

export default ContainerRow;
