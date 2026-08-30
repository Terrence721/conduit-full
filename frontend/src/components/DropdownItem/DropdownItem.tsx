import { Link } from "react-router-dom";

interface DropdownItemProps {
  handler?: () => void;
  icon: string;
  text: string;
  url?: string;
}

function DropdownItem({ handler, icon, text, url }: DropdownItemProps) {
  return (
    <Link className="dropdown-item" onClick={handler} to={url || "#"}>
      <i className={icon}></i> {text}
    </Link>
  );
}

export default DropdownItem;
