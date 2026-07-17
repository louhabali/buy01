import { CanActivateFn } from '@angular/router';
import { jwtDecode } from "jwt-decode";

export const sellerGuard: CanActivateFn = () => {

  const token = localStorage.getItem('token');

  if (!token) {

    return false;

  }

  const decoded: any = jwtDecode(token);

  return decoded.role === 'SELLER';

};