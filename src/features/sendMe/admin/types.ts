export interface SendMeLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SendMePartyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
}
