import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import userLogout from "../../services/userLogout";
import Avatar from "../Avatar/Avatar";
import DropdownItem from "../DropdownItem/DropdownItem";

function DropdownMenu() {
  const [dropdown, setDropdown] = useState(false);
  const { loggedUser, setAuthState } = useAuth();

  const logout = () => {
    setAuthState(userLogout());
  };

  const toggle = () => {
    setDropdown((prev) => !prev);
  };

  const close = () => {
    setDropdown(false);
  };

  const handleToggleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "Escape") {
      close();
      event.currentTarget.blur();
    }
  };

  return (
    <li className="nav-item dropdown">
      <button
        type="button"
        className="nav-link dropdown-toggle cursor-pointer"
        aria-expanded={dropdown}
        aria-haspopup="menu"
        onClick={toggle}
        onKeyDown={handleToggleKeyDown}
      >
        <Avatar
          alt={loggedUser.username}
          className="user-pic"
          src={loggedUser.image}
        />
        {loggedUser.username}
      </button>

      {dropdown && (
        <div className="dropdown-menu" onMouseLeave={close} role="menu">
          <DropdownItem
            icon="ion-person"
            text="Profile"
            url={`/profile/${loggedUser.username}`}
          />
          <DropdownItem icon="ion-gear-a" text="Settings" url="/settings" />
          <div className="dropdown-divider"></div>
          <DropdownItem icon="ion-log-out" text="Logout" handler={logout} />
        </div>
      )}
    </li>
  );
}

export default DropdownMenu;
