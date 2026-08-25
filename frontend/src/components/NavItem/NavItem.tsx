import { NavLink, type NavLinkRenderProps } from "react-router-dom";

interface NavItemProps {
  icon?: string;
  state?: unknown;
  text: string;
  url: string;
}

const activeClass = ({ isActive }: NavLinkRenderProps) =>
  `nav-link${isActive ? " active" : ""}`;

function NavItem({ icon, state, text, url }: NavItemProps) {
  return (
    <li className="nav-item">
      <NavLink className={activeClass} end state={state} to={url}>
        {icon ? (
          <>
            <i className={icon}></i> {text}
          </>
        ) : (
          text
        )}
      </NavLink>
    </li>
  );
}

export default NavItem;
