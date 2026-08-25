import { NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";

interface NavItemProps {
  icon?: string;
  text: string;
  url: string;
  state?: unknown;
}

function NavItem({ icon, text, url, state }: NavItemProps) {
  const activeClass = ({ isActive }: NavLinkRenderProps) =>
    `nav-link${isActive ? " active" : ""}`;

  return (
    <li className="nav-item">
      <NavLink className={activeClass} end state={state} to={url}>
        {icon && <i className={icon}></i>} {text}
      </NavLink>
    </li>
  );
}

export default NavItem;
