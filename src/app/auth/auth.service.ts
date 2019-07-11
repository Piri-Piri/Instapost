import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenExpiresTimer: any;
  private authStatusListener = new Subject<boolean>();
  private userId: string;

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserID() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post('http://localhost:3000/api/user/signup', authData)
    .subscribe(res => {
      this.router.navigate(['/']);
    }, err => {
      this.authStatusListener.next(false);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        this.token = response.token;
        if (this.token) {
          // set expiration timer and save token locally
          const now = new Date();
          const expiresIn = response.expiresIn * 1000;
          // timeout forced a logout
          this.setAuthTimer(expiresIn);
          this.isAuthenticated = true;
          this.userId = response.userId;
          // informs all "listeners" about successful login
          this.authStatusListener.next(true);
          const expirationDate = new Date(now.getTime() + expiresIn);
          this.saveAuthData(this.token, expirationDate, this.userId);
          // back to home
          this.router.navigate(['/']);
        }
      }, error => {
        // informs all "listeners" about FAILED login
        this.authStatusListener.next(true);
        // back to home
        this.router.navigate(['/']);
      });
  }

  authUserbyToken() {
    const authData = this.getAuthData();
    if (!authData) { return; }

    const now = new Date();
    const expiresIn = authData.expiration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authData.token;
      this.isAuthenticated = true;
      this.userId = authData.userId;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.userId = null;
    // informs all "listeners" about logout
    this.authStatusListener.next(false);
    // clear timer and saved token on logout
    clearTimeout(this.tokenExpiresTimer);
    this.clearAuthData();
    // back to home
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenExpiresTimer = setTimeout(() => { this.logout(); }, duration);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expiration) {
      return;
    }
    return {
      token,
      expiration: new Date(expiration),
      userId
    };
  }
}
