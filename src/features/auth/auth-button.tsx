import { getBakeryUser, getUser } from "@/lib/auth/auth-user";
import { LoggedInButton, SignInButton } from "./sign-in-button";

export const AuthButton = async () => {
  const user = await getUser();

  if (user) {
    const bakeryUser = await getBakeryUser();
    return <LoggedInButton user={user} bakeryUser={bakeryUser as any} />;
  }

  return <SignInButton />;
};
