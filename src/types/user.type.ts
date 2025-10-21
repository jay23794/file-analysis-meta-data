export interface IUser  {
  id?: string;
  name: string;
  email: string;
  age: number;
}

export interface ISaveUser extends Document,IUserMethods {
  id?: string;
  name: string;
  email: string;
  age: number;
  address:IAddress[];
  password:string;
  refreshToken?:string
}
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAddress {
  pincode: number;
  fullAddress: string;
  houseNumber?: string;
  city: string;
  state: string;
}