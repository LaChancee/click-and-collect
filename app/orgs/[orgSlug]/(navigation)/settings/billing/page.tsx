import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pricing } from "@/features/plans/pricing-section";
import { combineWithParentMetadata } from "@/lib/metadata";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "@/lib/auth/auth-plans";
import { OrgBilling } from "./org-billing";

export const generateMetadata = combineWithParentMetadata({
  title: "Billing",
  description: "Manage your organization billing.",
});

export default async function OrgBillingPage() {
  const org = await getRequiredCurrentOrgCache({
    permissions: {
      subscription: ["manage"],
    },
  });

  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: org.id,
    },
  });

  if (!subscription) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Free plan</CardTitle>
            <CardDescription>
              Upgrade to premium to unlock all features.
            </CardDescription>
          </CardHeader>
        </Card>
        <Pricing />
      </div>
    );
  }

  // Add limits to the subscription based on the plan
  const subscriptionWithLimits = {
    ...subscription,
    limits: getPlanLimits(subscription.plan),
  };

  return (
    <OrgBilling
      orgId={org.id}
      orgSlug={org.slug}
      subscription={subscriptionWithLimits}
    />
  );
}
