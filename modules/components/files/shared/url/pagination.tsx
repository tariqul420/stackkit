{{#if framework == "nextjs"}}
"use client";
{{/if}}

{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router-dom";
{{/if}}
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formUrlQuery } from "@/lib/utils/url-helpers";

interface PaginationProps {
  totalPages: number;
  paramKey?: string;
  siblingCount?: number;
  className?: string;
}

function buildPages(current: number, total: number, siblings: number): (number | "...")[] {
  const delta = siblings + 1;
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  const pages: (number | "...")[] = [1];
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
}

export default function Pagination({
  totalPages,
  paramKey = "page",
  siblingCount = 1,
  className,
}: PaginationProps) {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const currentPage = Math.max(1, Number(searchParams?.get(paramKey) ?? 1));

  const goTo = (page: number) => {
    const url = formUrlQuery({
      params: searchParams?.toString() ?? "",
      key: paramKey,
      value: page === 1 ? null : String(page),
    });
    {{#if framework == "nextjs"}}
    router.push(url, { scroll: true });
    {{else}}
    navigate(url);
    {{/if}}
  };

  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages, siblingCount);

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage > 1) goTo(currentPage - 1); }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((page, idx) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => { e.preventDefault(); goTo(page); }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) goTo(currentPage + 1); }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
