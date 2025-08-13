import { v4 as uuidv4 } from "uuid";
import {
  BankAccountId,
  BankId,
  BankOptions,
  BanksMap,
  UserAccountsMap,
  UserId,
} from "@/common/types";
import BankAccount from "./bank-account";

export default class Bank {
  private id: BankId;
  private options?: BankOptions;
  private accounts: BankAccountId[];
  private static banksMap: BanksMap = new Map();
  private userAccountsMap: UserAccountsMap;

  private constructor(id: BankId, options?: BankOptions) {
    this.id = id;
    this.options = options;
    this.accounts = [];
    this.userAccountsMap = new Map();
  }

  static create(options?: BankOptions): Bank {
    const id = uuidv4();
    const bank = new Bank(id, options);
    Bank.banksMap.set(id, bank);
    return bank;
  }

  static getById(id: BankId): Bank | undefined {
    return Bank.banksMap.get(id);
  }

  getId(): BankId {
    return this.id;
  }

  createAccount(initialBalance: number): BankAccount {
    const account = BankAccount.create(this.id, initialBalance);
    this.accounts.push(account.getId());
    return account;
  }

  getAccount(id: BankAccountId): BankAccount | undefined {
    return BankAccount.getById(id);
  }

  doesAllowNegativeBalance(): boolean {
    return this.options?.isNegativeAllowed ?? false;
  }

  setUserAccount(userId: UserId, accountId: BankAccountId) {
    const userAccounts = this.userAccountsMap.get(userId) ?? [];
    userAccounts.push(accountId);
    this.userAccountsMap.set(userId, userAccounts);
  }

  getUserAccounts(userId: UserId): BankAccountId[] | undefined {
    return this.userAccountsMap.get(userId);
  }

  send(
    fromUserId: UserId,
    toUserId: UserId,
    amount: number,
    toBankId?: BankId
  ) {
    const fromUserAccounts = this.userAccountsMap.get(fromUserId);
    const toBank = toBankId ? Bank.getById(toBankId) : this;
    const toUserAccounts = toBank?.getUserAccounts(toUserId);

    if (!fromUserAccounts || fromUserAccounts.length === 0) {
      throw new Error("Sender does not have an account in this bank.");
    }
    if (!toUserAccounts || toUserAccounts.length === 0) {
      throw new Error("Recipient does not have an account in this bank.");
    }
    if (fromUserId === toUserId && (!toBankId || toBankId === this.id)) {
      throw new Error("Cannot transfer to the same user in the same bank.");
    }

    let remainingAmountToDebit = amount;
    const fromAccounts = fromUserAccounts.map(id => BankAccount.getById(id));

    const totalSenderBalance = fromAccounts.reduce((sum, account) => sum + (account?.getBalance() ?? 0), 0);

    if (totalSenderBalance < amount && !this.doesAllowNegativeBalance()) {
      throw new Error("Insufficient funds");
    }

    for (const account of fromAccounts) {
        if (remainingAmountToDebit <= 0) break;
        if (!account) continue;

        const debitAmount = Math.min(remainingAmountToDebit, account.getBalance());
        if (debitAmount > 0) {
            account.setBalance(account.getBalance() - debitAmount);
            remainingAmountToDebit -= debitAmount;
        }
    }

    if (remainingAmountToDebit > 0 && this.doesAllowNegativeBalance()) {
        const firstAccount = fromAccounts[0];
        if (firstAccount) {
            firstAccount.setBalance(firstAccount.getBalance() - remainingAmountToDebit);
        }
    }

    const toUserAccount = BankAccount.getById(toUserAccounts[0]);
    if (toUserAccount) {
      toUserAccount.setBalance(toUserAccount.getBalance() + amount);
    }
  }
}