export interface AuthModel {
  username: string;
  password: string;
  rememberMe?: boolean;
}
export interface User {
  nameid: string;
  CustomerId: string;
  username: string;
  usertype: string;
  fullName: string;
  id: number;
  imagePath: string;
  unique_name: string;
  MOLNumber: string;
  BusinessNatureNameAr: string;
  BusinessNatureNameEn: string;
  email: string;
  phoneNumber: string;
  PortalUserType: string;
  Contracts: string;
  IsFirstLogIn: boolean;
  labId: number;
  labHasActivateService: string;
  labHasQuatationExpireDuration: string;
  dentistHasVisitPrice: string;
  dentistHasSupscription: string;
  labHasSupscription: string;
}
