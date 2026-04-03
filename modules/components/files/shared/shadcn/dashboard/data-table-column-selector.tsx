import { IconChevronDown } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { Columns3Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { BaseRecord } from "./data-table";

interface DataTableColumnSelectorProps<TData extends BaseRecord> {
  table: Table<TData>;
}

export default function DataTableColumnSelector<TData extends BaseRecord>({
  table,
}: DataTableColumnSelectorProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Columns3Icon />
          <span className="hidden lg:inline">View</span>
          <span className="lg:hidden">Columns</span>
          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}