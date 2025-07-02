import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export async function SidebarUserButtonServer() {
  // Pour éviter les problèmes d'imports avec next/headers,
  // on retourne simplement null pour l'utilisateur
  // Le composant client affichera "Non connecté"
  return <SidebarUserButtonClient user={null} />;
} 