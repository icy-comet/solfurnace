import { Header } from "@/components/Header";
import { TokenList } from "@/components/TokenList";
export default function Home() {
  return (
    <>
      <div className="min-h-screen mx-2">
        <Header />
        <TokenList />
      </div>
    </>
  );
}
