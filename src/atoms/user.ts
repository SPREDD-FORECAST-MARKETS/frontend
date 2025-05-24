import { atom } from "jotai";
import type { User } from "../types/apis";


export const userAtom = atom<User | null>(null);