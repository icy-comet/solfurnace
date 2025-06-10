"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, CircleX } from "lucide-react";
import { useContext, useState } from "react";
import { RpcContext } from "@/context/RpcContext";
import { ChainContext } from "@/context/ChainContext";
import { RpcDrawer } from "@/components/RpcDrawer";

export function RpcDrawerBtn() {
  const { rpc } = useContext(RpcContext);
  const { displayName } = useContext(ChainContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isSuccess } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const res = await rpc.getHealth().send();
      if (res !== "ok") {
        throw new Error();
      }
      return true;
    },
    refetchInterval: 5000,
    retry: false,
  });
  return (
    <>
      <Button
        className={`flex flex-wrap justify-center items-center cursor-pointer ${
          isSuccess ? "bg-green-800" : "bg-red-800"
        }`}
        onClick={() => setDrawerOpen(true)}
      >
        {isSuccess ? <CircleCheckBig /> : <CircleX />}
        {displayName}
      </Button>
      <RpcDrawer open={drawerOpen} setOpen={setDrawerOpen} />
    </>
  );
}
