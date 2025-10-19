import type { User } from "../types/user.type.js";

class UserModel{
    private users: User[] = [];
    
    findAll(): User[] {
    return this.users;
  }
}

export const userModel= new UserModel()