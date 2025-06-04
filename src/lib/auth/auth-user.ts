import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "../auth";
import { prisma } from "../prisma";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
};

export const getUser = async () => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  return user;
};

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  return user;
};

// Nouvelles fonctions pour différencier les types d'utilisateurs
export const getUserWithOrganizations = async () => {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Récupérer les organisations de l'utilisateur
  const userWithOrgs = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      members: {
        include: {
          organization: true,
        },
      },
    },
  });

  return userWithOrgs;
};

export const getBakeryUser = async () => {
  const userWithOrgs = await getUserWithOrganizations();

  if (!userWithOrgs) {
    return null;
  }

  // Trouver l'organisation boulangerie de l'utilisateur
  const bakeryMembership = userWithOrgs.members.find(
    (member) => member.organization.isBakery,
  );

  if (!bakeryMembership) {
    return null;
  }

  return {
    user: userWithOrgs,
    bakery: bakeryMembership.organization,
    role: bakeryMembership.role,
  };
};

export const getRequiredBakeryUser = async () => {
  const bakeryUser = await getBakeryUser();

  if (!bakeryUser) {
    unauthorized();
  }

  return bakeryUser;
};

export const isUserBakery = async () => {
  const bakeryUser = await getBakeryUser();
  return bakeryUser !== null;
};
