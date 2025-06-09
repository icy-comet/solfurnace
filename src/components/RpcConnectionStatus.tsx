import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";

export function RpcConnectionStatus() {
  return (
    <Badge variant="secondary">
      <Link2 />
      Connection Live
    </Badge>
  );
}
