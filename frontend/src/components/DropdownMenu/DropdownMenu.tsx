import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import userLogout from "../../services/userLogout";
import Avatar from "../Avatar/Avatar";
import DropdownItem from "../DropdownItem/DropdownItem";

function DropdownMenu() {
  const [dropdown, setDropdown] = useState(false);
  const { loggedUser, setAuthState } = useAuth();

  const logout = () => {
    setAuthState(userLogout());
  };

  const handleClick = () => {
    setDropdown((prev) => !prev);
  };

  return (
    <li className="nav-item dropdown">
      <div
        className="nav-link dropdown-toggle cursor-pointer"
        onClick={handleClick}
      >
        <Avatar
          alt={loggedUser.username}
          className="user-pic"
          src={loggedUser.image}
        />
        {loggedUser.username}
      </div>

      <div
        className="dropdown-menu"
        style={{ display: dropdown ? "block" : "none" }}
        onMouseLeave={handleClick}
      >
        <DropdownItem
          icon="ion-person"
          text="Profile"
          url={`/profile/${loggedUser.username}`}
        />
        <DropdownItem icon="ion-gear-a" text="Settings" url="/settings" />
        <div className="dropdown-divider"></div>
        <DropdownItem icon="ion-log-out" text="Logout" handler={logout} />
      </div>
    </li>
  );
}

export default DropdownMenu;
