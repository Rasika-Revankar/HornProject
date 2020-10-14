import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class HornService {

  constructor(private http: HttpClient) { }

  getproviders() {
    return this.http.get('https://horn.co/api/v1_0/auth/clients/XOQZIpR3NNwA3sRZWac2/providers/auth');
  }

  getAuthorized() {
    return this.http.get('https://horn.co/api/v1_0/auth/oauth/authenticate/XOQZIpR3NNwA3sRZWac2/google?mobile=false')
  }

  getContextUser() {
    return this.http.get('https://horn.co/api/v1_0/auth/context/XOQZIpR3NNwA3sRZWac2');
  }

  // https://horn.co/api/v1_0/auth/oauth/authenticate/Jx3aUbYM6YRozL7AtR1J/facebook?redir=http%3A%2F%2Fmy.app.com%2Flogin&mobile=tru
}
