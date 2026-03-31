import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

interface NoResultsProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function NoResults({
  title = "No Results Found",
  description = "We couldn't find what you're looking for. Try adjusting your search or filters.",
  className,
}: NoResultsProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-6">
        {/* Main content */}
        <div className="relative flex flex-col items-center">
          {/* Icon with modern styling */}
          <div className="group relative mb-8">
            <div className="bg-card ring-border/50 relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-1 transition-all duration-300 group-hover:scale-105">
              <SearchX className="text-muted-foreground group-hover:text-foreground h-8 w-8 transition-colors duration-300" />
            </div>
          </div>

          {/* Text content */}
          <div className="text-center">
            <h3 className="text-foreground mb-3 text-2xl font-semibold">
              {title}
            </h3>
            <p className="text-muted-foreground mx-auto max-w-md text-base">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}