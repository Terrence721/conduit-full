import { Link } from "react-router-dom";

interface DropdownItemProps {
  handler?: () => void;
  icon: string;
  state?: unknown;
  text: string;
  url?: string;
}

function DropdownItem({ handler, icon, state, text, url }: DropdownItemProps) {
  return (
    <Link
      className="dropdown-item"
      onClick={handler}
      state={state}
      to={url || "#"}
    >
      <i className={icon}></i> {text}
    </Link>
  );
}

export default DropdownItem;
