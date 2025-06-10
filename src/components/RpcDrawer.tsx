"use client";
import React, { ChangeEvent, useCallback, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useQueryClient } from "@tanstack/react-query";
import { ChainContext } from "@/context/ChainContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RpcDrawer({ open, setOpen }: Props) {
  const { setChain } = useContext(ChainContext);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isValidURL, setIsValidURL] = useState(true);
  const queryClient = useQueryClient();
  const commonBtnCallback = useCallback(async () => {
    setIsInputVisible(false);
    await queryClient.invalidateQueries({ queryKey: ["status"] });
  }, [queryClient, setIsInputVisible]);
  const setChainFromInput = useDebouncedCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const url = new URL(e.target.value);
        setIsValidURL(true);
        if (setChain) setChain("solana:custom", e.target.value);
      } catch {
        setIsValidURL(false);
      }
    },
    500
  );
  if (setChain)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Choose RPC</SheetTitle>
            <SheetDescription>
              Choose between the given ones, or enter your own.
            </SheetDescription>
          </SheetHeader>
          <Button onClick={() => setIsInputVisible(true)}>
            Mainnet (Custom)
          </Button>
          <Button
            onClick={async () => {
              setChain("solana:devnet");
              await commonBtnCallback();
            }}
          >
            Devnet
          </Button>
          <Button
            onClick={async () => {
              setChain("solana:testnet");
              await commonBtnCallback();
            }}
          >
            Testnet
          </Button>
          <Button
            onClick={async () => {
              setChain("solana:localnet");
              await commonBtnCallback();
            }}
          >
            Localnet
          </Button>
          {isInputVisible && (
            <Input
              type="text"
              placeholder="RPC URL"
              onChange={setChainFromInput}
              aria-invalid={!isValidURL}
            />
          )}
        </SheetContent>
      </Sheet>
    );
}
