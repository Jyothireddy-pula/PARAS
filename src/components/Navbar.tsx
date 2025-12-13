import AdminMenu from "./AdminMenu";
import OwnerMenu from "./OwnerMenu";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { role } = useAuth();

  return (
    <>
      {role === "admin" && <AdminMenu />}
      {role === "owner" && <OwnerMenu />}
    </>
  );
};
