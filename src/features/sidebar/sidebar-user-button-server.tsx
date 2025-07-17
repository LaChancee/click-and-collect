import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export function SidebarUserButtonServer() {
  // Version simplifiée qui retourne directement le composant client
  return <SidebarUserButtonClient />;
} 