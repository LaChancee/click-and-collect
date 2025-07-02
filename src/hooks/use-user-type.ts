import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

interface UserTypeResponse {
  isBakery: boolean;
  isClient: boolean;
  bakeryInfo?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useUserType() {
  const session = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["user-type", session.data?.user?.id],
    queryFn: async (): Promise<UserTypeResponse> => {
      if (!session.data?.user?.id) {
        return { isBakery: false, isClient: false };
      }

      const response = await fetch("/api/auth/verify-user-type");
      if (!response.ok) {
        throw new Error("Failed to verify user type");
      }
      return response.json();
    },
    enabled: !!session.data?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isBakery: data?.isBakery ?? false,
    isClient: data?.isClient ?? true,
    bakeryInfo: data?.bakeryInfo,
    isLoading: isLoading && !!session.data?.user?.id,
  };
}
