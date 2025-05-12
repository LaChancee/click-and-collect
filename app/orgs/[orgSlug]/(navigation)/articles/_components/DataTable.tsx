'use client';

import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export function DataTable({
  columns,
  data,
  filterColumn,
  searchPlaceholder,
  categoriesMap,
  baseUrl
}: {
  columns: any[];
  data: any[];
  filterColumn: string;
  searchPlaceholder: string;
  categoriesMap: Record<string, string>;
  baseUrl: string;
}) {
  const [searchText, setSearchText] = useState('');

  const filteredData = searchText
    ? data.filter(item =>
      item[filterColumn].toLowerCase().includes(searchText.toLowerCase())
    )
    : data;

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full max-w-sm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column: any) => (
              <th key={column.id || column.accessorKey} className="p-2 text-left">
                {typeof column.header === 'function'
                  ? column.header({ column })
                  : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row: any, i: number) => (
            <tr key={i} className="border-t">
              {columns.map((column: any) => (
                <td key={column.id || column.accessorKey} className="p-2">
                  {column.cell
                    ? column.cell({
                      row: {
                        original: row,
                        getValue: (key: string) => row[key]
                      }
                    })
                    : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 