export interface IUser {
  id?: string;
  name: string;
  email: string;
  age: number;
}

export interface ISaveUser  {
  id?: string;
  name: string;
  email: string;
  age: number;
  address:IAddress[];
  password:string;
}

export interface IAddress {
  pincode: number;
  fullAddress: string;
  houseNumber?: string;
  city: string;
  state: string;
}