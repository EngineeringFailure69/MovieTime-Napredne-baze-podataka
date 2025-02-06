import { jwtDecode } from 'jwt-decode';

export const UserFetch = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null; 
    const decoded = jwtDecode(token);
    return decoded;

  } catch (error) {
    console.error('Greška pri preuzimanju korisničkih podataka:', error);
    return null; 
  }
};
