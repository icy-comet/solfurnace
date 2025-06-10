"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { ChangeEvent, useContext, useState } from "react";
import { ChainContext } from "@/context/ChainContext";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function RpcDrawer({ open, setOpen }: Props) {
  const { setChain } = useContext(ChainContext);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isValidURL, setIsValidURL] = useState(true);
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
            onClick={() => {
              setChain("solana:devnet");
              setIsInputVisible(false);
            }}
          >
            Devnet
          </Button>
          <Button
            onClick={() => {
              setChain("solana:testnet");
              setIsInputVisible(false);
            }}
          >
            Testnet
          </Button>
          <Button
            onClick={() => {
              setChain("solana:localnet");
              setIsInputVisible(false);
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
