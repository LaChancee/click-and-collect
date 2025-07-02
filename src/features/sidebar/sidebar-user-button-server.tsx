import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export async function SidebarUserButtonServer() {
  // Version simplifiée qui retourne directement le composant client
  return <SidebarUserButtonClient />;
} 