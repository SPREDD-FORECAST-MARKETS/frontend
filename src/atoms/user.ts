import { atom } from "jotai";
import type { User } from "../types/apis";
import type { GetBalanceReturnType } from "@wagmi/core";


export const userAtom = atom<User | null>(null);
export const refreshUserAtom = atom<number>(0);
export const balanceAtom = atom<GetBalanceReturnType | null> (null);