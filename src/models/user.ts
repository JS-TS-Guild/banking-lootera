import { v4 as uuidv4 } from "uuid";
import { UserId, UserMap } from "@/common/types";
import { BankAccountId } from "@/common/types";
import BankAccount from "./bank-account";
import Bank from "./bank";

export default class User {
  private id: UserId;
  private name: string;
  private accountIds: BankAccountId[];
  private static usersMap: UserMap = new Map();

  private constructor(id: UserId, name: string, accountIds: BankAccountId[]) {
    this.id = id;
    this.name = name;
    this.accountIds = accountIds;
    for (const accountId of accountIds) {
      const bankAccount = BankAccount.getById(accountId);
      const bank = Bank.getById(bankAccount.getBankId());
      bank.setUserAccount(this.id, accountId);
    }
  }

  static create(name: string, accountIds: BankAccountId[]): User {
    const id = uuidv4();
    const user = new User(id, name, accountIds);
    User.usersMap.set(id, user);
    return user;
  }

  static getById(id: UserId): User {
    return User.usersMap.get(id);
  }

  getId(): UserId {
    return this.id;
  }

  getAccounts(): BankAccountId[] {
    return this.accountIds;
  }
}