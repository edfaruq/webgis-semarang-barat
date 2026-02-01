import InactivityLogout from "@/components/InactivityLogout";
import { logoutAction } from "./actions";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InactivityLogout logoutAction={logoutAction}>
      {children}
    </InactivityLogout>
  );
}
