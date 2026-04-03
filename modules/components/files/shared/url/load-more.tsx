{{#if framework == "nextjs"}}
"use client";
{{/if}}

import { useEffect, useRef, useState } from "react";
{{#if framework == "nextjs"}}
import { useRouter, useSearchParams } from "next/navigation";
{{else}}
import { useNavigate, useSearchParams } from "react-router";
{{/if}}
import { formUrlQuery } from "@/lib/utils/url-helpers";

const LoadMore = ({ hasNextPage }: { hasNextPage: boolean }) => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const searchParams = useSearchParams();
  {{else}}
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  {{/if}}

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams?.get("page");
    return page ? Number(page) : 1;
  });

  useEffect(() => {
    isLoadingRef.current = false;
  }, []);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);

        if (entry.isIntersecting && !isLoadingRef.current && hasNextPage) {
          isLoadingRef.current = true;

          setTimeout(() => {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

            const url = formUrlQuery({
              params: searchParams?.toString() ?? "",
              key: "page",
              value: nextPage.toString(),
            });

            {{#if framework == "nextjs"}}
            router.push(url, { scroll: false });
            {{else}}
            navigate(url, { replace: false });
            {{/if}}
          }, 500);
        }
      },
      { threshold: 0.8, rootMargin: "400px" },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    currentPage,
    {{#if framework == "nextjs"}}
    router,
    {{else}}
    navigate,
    {{/if}}
    searchParams,
  ]);

  return (
    <div ref={loaderRef} className="my-8 flex h-20 w-full items-center justify-center">
      {isVisible && (
        <div className="flex flex-col items-center gap-2">
          <div className="border-accent-main h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          <span className="text-sm text-gray-500">Loading more ...</span>
        </div>
      )}
    </div>
  );
};

export default LoadMore;
