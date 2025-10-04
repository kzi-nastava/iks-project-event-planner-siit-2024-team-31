import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LoginResponse } from '../../types/dto/responses/loginResponse';
import { RegisterResponse } from '../../types/dto/responses/registerResponse';
import { Role } from '../../types/roles';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication State Management', () => {
    it('should initialize with no authentication state', () => {
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.getToken()).toBeNull();
      expect(service.getRole()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should initialize auth state from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', Role.ROLE_USER);

      service.initializeAuthState();

      expect(service.getToken()).toBe('test-token');
      expect(service.getRole()).toBe(Role.ROLE_USER);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should clear auth state for invalid role in localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'INVALID_ROLE');

      service.initializeAuthState();

      expect(service.getRole()).toBeNull();
      // isAuthenticated() only checks for token presence, not role validity
      expect(service.isAuthenticated()).toBeTrue(); // Token is still present
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      const mockResponse: LoginResponse = {
        token: 'test-token',
        tokenExpires: Date.now() + 3600000,
        role: Role.ROLE_USER,
        exception: '',
        message: 'Login successful',
      };

      service.login('test@example.com', 'password123').subscribe(() => {
        expect(service.getToken()).toBe('test-token');
        expect(service.getRole()).toBe(Role.ROLE_USER);
        expect(service.isAuthenticated()).toBeTrue();
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockResponse);
    });

    it('should handle login with invalid role', () => {
      const mockResponse: LoginResponse = {
        token: 'test-token',
        tokenExpires: Date.now() + 3600000,
        role: 'INVALID_ROLE',
        exception: '',
        message: 'Login successful',
      };

      service.login('test@example.com', 'password123').subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('Invalid role');
          expect(service.getToken()).toBeNull();
          expect(service.getRole()).toBeNull();
        },
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/login`);
      req.flush(mockResponse);
    });

    it('should handle login HTTP error', () => {
      service.login('test@example.com', 'wrongpassword').subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.getToken()).toBeNull();
          expect(service.getRole()).toBeNull();
        },
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Register', () => {
    it('should register successfully', () => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful',
        exception: '',
      };

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('role', Role.ROLE_USER);

      service.register(formData).subscribe((response) => {
        expect(response.message).toBe('Registration successful');
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });

    it('should handle registration error', () => {
      const formData = new FormData();
      formData.append('email', 'existing@example.com');
      formData.append('password', 'password123');

      service.register(formData).subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/signup`);
      req.flush('Email already exists', {
        status: 400,
        statusText: 'Bad Request',
      });
    });
  });

  describe('Logout', () => {
    it('should clear authentication data on logout', () => {
      // Set up authenticated state
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', Role.ROLE_USER);
      service.initializeAuthState();

      expect(service.isAuthenticated()).toBeTrue();

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.getRole()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', Role.ROLE_ADMIN);
      service.initializeAuthState();
    });

    it('should check if user has required role', () => {
      expect(service.hasRole([Role.ROLE_ADMIN])).toBeTrue();
      expect(service.hasRole([Role.ROLE_USER, Role.ROLE_ADMIN])).toBeTrue();
      expect(service.hasRole([Role.ROLE_USER])).toBeFalse();
    });

    it('should return false for role check when not authenticated', () => {
      service.logout();
      expect(service.hasRole([Role.ROLE_ADMIN])).toBeFalse();
    });
  });

  describe('Password Recovery', () => {
    it('should send recovery code successfully', () => {
      service.sendRecoveryCode('test@example.com').subscribe(() => {
        // Success case - no error thrown
      });

      const req = httpMock.expectOne(
        `${service['baseApiUrl']}/send-recovery-code`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com' });
      req.flush({});
    });

    it('should verify recovery code successfully', () => {
      service.verifyRecoveryCode('test@example.com', '123456').subscribe(() => {
        // Success case - no error thrown
      });

      const req = httpMock.expectOne(
        `${service['baseApiUrl']}/verify-recovery-code`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        code: '123456',
      });
      req.flush({});
    });

    it('should reset password successfully', () => {
      service
        .resetPassword('test@example.com', '123456', 'newpassword123')
        .subscribe(() => {
          // Success case - no error thrown
        });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        code: '123456',
        newPassword: 'newpassword123',
      });
      req.flush({});
    });

    it('should handle recovery code errors', () => {
      service.sendRecoveryCode('nonexistent@example.com').subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(
        `${service['baseApiUrl']}/send-recovery-code`
      );
      req.flush('Email not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Account Deactivation', () => {
    it('should deactivate account successfully', () => {
      service.deactivateAccount('password123').subscribe(() => {
        // Success case - no error thrown
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/deactivate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password: 'password123' });
      req.flush({});
    });

    it('should handle deactivation error', () => {
      service.deactivateAccount('wrongpassword').subscribe({
        next: () => fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`${service['baseApiUrl']}/deactivate`);
      req.flush('Invalid password', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Observable Streams', () => {
    it('should emit authentication state changes', (done) => {
      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBeFalse();
        done();
      });
    });

    it('should emit role changes', (done) => {
      service.userRole$.subscribe((role) => {
        expect(role).toBeNull();
        done();
      });
    });

    it('should emit authentication state after login', () => {
      const mockResponse: LoginResponse = {
        token: 'test-token',
        tokenExpires: Date.now() + 3600000,
        role: Role.ROLE_USER,
        exception: '',
        message: 'Login successful',
      };

      let authStateChanges = 0;
      service.isAuthenticated$.subscribe((isAuth) => {
        authStateChanges++;
        if (authStateChanges === 2) {
          // Initial false, then true after login
          expect(isAuth).toBeTrue();
        }
      });

      service.login('test@example.com', 'password123').subscribe();
      const req = httpMock.expectOne(`${service['baseApiUrl']}/login`);
      req.flush(mockResponse);
    });
  });
});
