'use client';

import { DataTable } from "../articles/_components/DataTable";
import { columns } from "./promotions-columns";

type PromotionsDataTableProps = {
  data: any[];
  orgSlug: string;
}

export function PromotionsDataTable({ data, orgSlug }: PromotionsDataTableProps) {
  return (
    <DataTable
      columns={columns(orgSlug)}
      data={data}
      filterColumn="name"
      searchPlaceholder="Rechercher par nom..."
      categoriesMap={{}}
      baseUrl={`/orgs/${orgSlug}/promotions`}
    />
  );
} 