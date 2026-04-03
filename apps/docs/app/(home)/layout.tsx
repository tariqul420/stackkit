import { Footer } from "@/components/footer";
import { homeOptions } from "@/lib/layout.shared";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout {...homeOptions()}>
      {children}
      <Footer />
    </HomeLayout>
  );
}
