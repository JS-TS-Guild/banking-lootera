
import Bank from "@/models/bank";
import BankAccount from "@/models/bank-account";
import User from "@/models/user";

export type BankAccountId = string;
export type UserId = string;
export type BankId = string;
export type BankOptions = {
  isNegativeAllowed?: boolean;
};
export type BanksMap = Map<BankId, Bank>;
export type BankAccountsMap = Map<BankAccountId, BankAccount>;
export type UserMap = Map<UserId, User>;
export type UserAccountsMap = Map<UserId, BankAccountId[]>;