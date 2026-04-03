{{#if framework == "nextjs"}}
"use client";
{{/if}}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSort,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
  type Table as TableInstance,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
{{#if framework == "nextjs"}}
import Link from "next/link";
import { useRouter } from "next/navigation";
{{else}}
import { Link, useNavigate } from "react-router";
{{/if}}
import * as React from "react";
import { toast } from "sonner";
import DataTableColumnSelector from "./data-table-column-selector";
import DataTableFooter from "./data-table-footer";

export interface BaseRecord {
  _id?: string | number;
  id?: string | number;
  [key: string]: unknown;
}

interface DataTableProps<T extends BaseRecord> {
  data?: T[];
  columns?: ColumnDef<T>[];
  pageSize?: number;
  pageIndex?: number;
  total?: number;
  uniqueIdProperty?: string;
  defaultSort?: ColumnSort[];
  enableRowSelection?: boolean;
  onDeleteMany?: (ids: string[]) => Promise<void>;
  actionLink?: { href: string; label: string };
  actionModal?: { form: React.ReactNode; label: string; title?: string };
  rightSite?: React.ReactNode;
  hasHeaderFooter?: boolean;
}

/** Unified way to read a record's unique id */
function getRowIdValue<T extends BaseRecord>(row: T, uniqueIdKey: string) {
  const raw = row[uniqueIdKey] ?? row.id ?? row._id;
  return typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
}

export function DataTable<T extends BaseRecord>({
  data: initialData = [],
  columns = [],
  pageSize = 20,
  pageIndex = 1,
  total = 0,
  uniqueIdProperty = "id",
  defaultSort = [],
  enableRowSelection = true,
  onDeleteMany,
  actionLink,
  actionModal,
  rightSite,
  hasHeaderFooter = true,
}: DataTableProps<T>) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  {{else}}
  const navigate = useNavigate();
  {{/if}}
  const [data, setData] = React.useState<T[]>(initialData);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>(defaultSort);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: Math.max(0, pageIndex - 1),
    pageSize,
  });

  // skeleton only during page changes after initial load
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const prevPageIndex = React.useRef(pagination.pageIndex);

  const uniqueIdRef = React.useRef(uniqueIdProperty);
  uniqueIdRef.current = uniqueIdProperty;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<T>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => getRowIdValue(row, uniqueIdRef.current),
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    onColumnFiltersChange: setColumnFilters as OnChangeFn<ColumnFiltersState>,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Selected IDs derived from table state (lint-friendly deps)
  const selection = table.getState().rowSelection as Record<string, boolean>;
  const selectedIds = React.useMemo<string[]>(
    () => Object.keys(selection).filter((id) => selection[id]),
    [selection],
  );

  // Refresh local data when server data changes
  React.useEffect(() => {
    setData(initialData);
    setIsInitialLoad(false);
  }, [initialData]);

  // Show skeleton when paginating (not on first paint)
  React.useEffect(() => {
    const changed = pagination.pageIndex !== prevPageIndex.current;
    if (!isInitialLoad && changed) {
      setIsTableLoading(true);
      prevPageIndex.current = pagination.pageIndex;
    }
  }, [pagination.pageIndex, isInitialLoad]);

  React.useEffect(() => {
    if (!isTableLoading) return;
    const t = setTimeout(() => setIsTableLoading(false), 400);
    return () => clearTimeout(t);
  }, [isTableLoading]);

  // Bulk delete
  const handleDeleteMany = React.useCallback(async () => {
    if (!onDeleteMany || selectedIds.length === 0) return;

    toast.promise(
      onDeleteMany(selectedIds).then(() => {
        table.resetRowSelection();
        setIsDialogOpen(false);
      }),
      {
        loading: "Deleting selected items...",
        success: () => {
          {{#if framework == "nextjs"}}
          router.refresh();
          {{/if}}
          return `Successfully deleted ${selectedIds.length} item${
            selectedIds.length > 1 ? "s" : ""
          }`;
        },
        error: (err) => (err?.message as string) || "Failed to delete items",
      },
    );
  }, [onDeleteMany, selectedIds, table, router]);

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      {/* Toolbar */}
      <div
        className={cn(
          "grid items-center gap-3 sm:grid-cols-[1fr_auto]",
          hasHeaderFooter ? "" : "hidden",
        )}
      >
        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-2">
          <DataTableColumnSelector table={table} />

          {actionModal && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-8">
                  <IconPlus size={16} />
                  <span>{actionModal.label}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-150 overflow-y-auto">
                {actionModal.title && (
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl">
                      {actionModal.title}
                    </DialogTitle>
                  </DialogHeader>
                )}
                {actionModal.form}
              </DialogContent>
            </Dialog>
          )}

          {/* Bulk Delete */}
          {onDeleteMany && selectedIds.length > 0 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8">
                  Delete ({selectedIds.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Selected Items</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {selectedIds.length}{" "}
                    selected item{selectedIds.length > 1 ? "s" : ""}? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteMany}>
                    Yes, Delete {selectedIds.length > 1 ? "All" : "It"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2">
          {actionLink && (
            <Button variant="outline" asChild>
              {{#if framework == "nextjs"}}
              <Link href={actionLink.href} className="flex items-center gap-2">
              {{else}}
              <Link to={actionLink.href} className="flex items-center gap-2">
              {{/if}}
                <IconPlus size={16} />
                <span>{actionLink.label}</span>
              </Link>
            </Button>
          )}
          {rightSite && rightSite}
        </div>
      </div>

      {/* Table */}
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto rounded-lg"
      >
        <div className="bg-light overflow-hidden rounded-lg border dark:bg-transparent">
          <Table>
            <TableHeader className="bg-light-bg/50 dark:bg-dark-hover sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {isTableLoading ? (
                Array.from({ length: pagination.pageSize }).map((_, i) => (
                  <TableRow key={i as number}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="relative"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className={cn(hasHeaderFooter ? "" : "hidden")}>
          <DataTableFooter
            table={table}
            pageSize={pagination.pageSize}
            total={total}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

/** Selection checkbox column */
export function createSelectionColumn<T extends BaseRecord>() {
  return {
    id: "select",
    header: ({ table }: { table: TableInstance<T> }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="border-border"
        />
      </div>
    ),
    cell: ({ row }: { row: Row<T> }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<T>;
}