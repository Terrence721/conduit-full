import type { ReactNode } from "react";

interface ContainerRowProps {
  children: ReactNode;
  page?: boolean;
}

function ContainerRow({ children, page }: ContainerRowProps) {
  return (
    <div className={`container${page ? " page" : ""}`}>
      <div className="row">{children}</div>
    </div>
  );
}

export default ContainerRow;
