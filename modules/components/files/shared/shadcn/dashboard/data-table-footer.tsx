{{#if framework == "nextjs"}}
"use client";
{{/if}}

import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils/url-helpers";
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router";
{{/if}}
import SelectField from "../global/form-field/select-field";
import { Button } from "../ui/button";
import type { BaseRecord } from "./data-table";

interface DataTableFooterProps<TData extends BaseRecord> {
  table: Table<TData>;
  pageSize: number;
  total: number;
}

export default function DataTableFooter<TData extends BaseRecord>({
  table,
  pageSize,
  total,
}: DataTableFooterProps<TData>) {
  {{#if framework == "nextjs"}}
  const searchParams = useSearchParams();
  const router = useRouter();
  if (!searchParams) return null;
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}
  const currentPage = Number(searchParams.get("pageIndex")) || 1;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    const query = formUrlQuery({
      params: searchParams.toString(),
      key: "pageIndex",
      value: newPage.toString(),
    });

    {{#if framework == "nextjs"}}
    router.push(query, { scroll: false });
    {{else}}
    navigate(query);
    {{/if}}
    table.setPageIndex(newPage - 1);
  };

  const handlePageSizeChange = (value: string | number | undefined) => {
    if (typeof value === "undefined" || value === null) return;
    const valueStr = String(value);
    const newUrl = valueStr
      ? formUrlQuery({
          params: searchParams.toString(),
          key: "pageSize",
          value: valueStr,
        })
      : removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["pageSize"],
        });

    {{#if framework == "nextjs"}}
    router.push(newUrl, { scroll: false });
    {{else}}
    navigate(newUrl);
    {{/if}}
    table.setPageSize(Number(valueStr));
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Selected Rows Summary */}
      <div className="text-muted-foreground hidden text-sm lg:block">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected
      </div>

      <div className="flex flex-col items-start gap-3 sm:w-full sm:flex-row sm:items-center sm:justify-between lg:w-auto">
        {/* Rows Per Page - Only on large screens */}

        <SelectField
          label="Rows per page"
          value={`${pageSize}`}
          placeholder={`${pageSize}`}
          onValueChange={handlePageSizeChange}
          options={[25, 50, 75, 100].map((size) => ({
            value: size,
            label: `${size}`,
          }))}
          className="hidden items-center gap-2 lg:flex"
        />

        {/* Range Info */}
        <div className="text-muted-foreground text-sm">
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, total)} of {total} rows
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 p-0 lg:inline-flex"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
          >
            <IconChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <IconChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:inline-flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <IconChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}