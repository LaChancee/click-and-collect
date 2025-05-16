'use client';

import { DataTable } from "../articles/_components/DataTable";
import { columns } from "./meal-deals-columns";

type MealDealsDataTableProps = {
  data: any[];
  orgSlug: string;
}

export function MealDealsDataTable({ data, orgSlug }: MealDealsDataTableProps) {
  return (
    <DataTable
      columns={columns(orgSlug)}
      data={data}
      filterColumn="name"
      searchPlaceholder="Rechercher par nom..."
      categoriesMap={{}}
      baseUrl={`/orgs/${orgSlug}/meal-deals`}
    />
  );
} 