import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { RegisterResponse } from '../../../types/dto/responses/registerResponse';
import { Role } from '../../../types/roles';
import { RegisterComponent } from './register.component';

describe('RegisterComponent - Registration form testing (Student 1)', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;

  let authService: any;
  let notificationService: any;
  let router: Router;

  const setup = async () => {
    authService = jasmine.createSpyObj<Partial<AuthService>>('AuthService', [
      'register',
    ]) as any;
    notificationService = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['success', 'error', 'validationError']
    ) as any;

    await TestBed.configureTestingModule({
      // standalone компонент можно импортировать напрямую
      imports: [RegisterComponent, FormsModule],
      providers: [
        provideHttpClientTesting(),
        provideRouter([]), // современный роутер-провайдер
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    // шпионим реальный Router.navigate
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
  };

  const fillCommon = (
    role: Role,
    email = 'test@example.com',
    pass = 'Password123!'
  ) => {
    component.user.role = role;
    component.user.email = email;
    component.user.password = pass;
    component.confirmPassword = pass;
  };

  beforeEach(async () => {
    await setup();
  });

  // ============================================
  // 1. BASIC TESTS - Component creation
  // ============================================
  describe('1. Component creation', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.user.role).toBe(Role.ROLE_USER);
      expect(component.user.email).toBe('');
      expect(component.user.password).toBe('');
      expect(component.confirmPassword).toBe('');
      expect(component.isSubmitting).toBe(false);
      expect(component.registrationError).toBe('');
      expect(component.filesForUpload).toEqual([]);
      expect(component.previewUrls).toEqual([]);
    });
  });

  // ============================================
  // 2. FORM VALIDATION TESTS - Positive scenarios
  // ============================================
  describe('2. Form validation - Positive scenarios', () => {
    it('should accept valid email format', () => {
      component.user.email = 'test@example.com';
      expect(component.user.email).toBe('test@example.com');
    });

    it('should accept matching passwords', () => {
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      expect(component.user.password).toBe(component.confirmPassword);
    });

    it('should set ROLE_USER correctly', () => {
      component.user.role = Role.ROLE_USER;
      expect(component.user.role).toBe(Role.ROLE_USER);
    });

    it('should set ROLE_OD correctly', () => {
      component.user.role = Role.ROLE_OD;
      expect(component.user.role).toBe(Role.ROLE_OD);
    });

    it('should set ROLE_PUP correctly', () => {
      component.user.role = Role.ROLE_PUP;
      expect(component.user.role).toBe(Role.ROLE_PUP);
    });

    it('should accept all required fields for ROLE_USER', () => {
      component.user.role = Role.ROLE_USER;
      component.user.email = 'user@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Ivan';
      component.user.lastName = 'Petrovic';
      component.user.phoneNumber = '+381601234567';

      expect(component.user.firstName).toBe('Ivan');
      expect(component.user.lastName).toBe('Petrovic');
      expect(component.user.phoneNumber).toBe('+381601234567');
    });

    it('should accept all required fields for ROLE_OD', () => {
      component.user.role = Role.ROLE_OD;
      component.user.email = 'organizer@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Marko';
      component.user.lastName = 'Markovic';
      component.user.phoneNumber = '+381607654321';

      expect(component.user.firstName).toBe('Marko');
      expect(component.user.lastName).toBe('Markovic');
      expect(component.user.phoneNumber).toBe('+381607654321');
    });

    it('should accept all required fields for ROLE_PUP including description', () => {
      component.user.role = Role.ROLE_PUP;
      component.user.email = 'provider@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Company DOO';
      component.user.phoneNumber = '+381601111111';
      component.user.description = 'We provide excellent event services';

      expect(component.user.firstName).toBe('Company DOO');
      expect(component.user.description).toBe(
        'We provide excellent event services'
      );
    });

    it('should accept address fields', () => {
      component.user.address.country = 'Serbia';
      component.user.address.city = 'Belgrade';
      component.user.address.street = 'Kneza Milosa 10';
      component.user.address.zipCode = '11000';

      expect(component.user.address.country).toBe('Serbia');
      expect(component.user.address.city).toBe('Belgrade');
      expect(component.user.address.street).toBe('Kneza Milosa 10');
      expect(component.user.address.zipCode).toBe('11000');
    });
  });

  // ============================================
  // 3. VALIDATION TESTS - Negative scenarios
  // ============================================
  describe('3. Form validation - Negative scenarios', () => {
    it('should not submit when passwords do not match', () => {
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'DifferentPassword123!';
      component.user.role = Role.ROLE_USER;

      component.onSubmit();

      expect(notificationService.validationError).toHaveBeenCalledWith(
        'Passwords do not match'
      );
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should not submit when role is not selected', () => {
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.role = null as any;

      component.onSubmit();

      expect(notificationService.validationError).toHaveBeenCalledWith(
        'Please, choose a role'
      );
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should reject empty email', () => {
      component.user.email = '';
      expect(component.user.email).toBe('');
    });

    it('should reject empty password', () => {
      component.user.password = '';
      expect(component.user.password).toBe('');
    });

    it('should reject empty confirmPassword', () => {
      component.confirmPassword = '';
      expect(component.confirmPassword).toBe('');
    });
  });

  // ============================================
  // 4. EDGE CASES TESTS
  // ============================================
  describe('4. Edge cases', () => {
    it('should handle very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      component.user.email = longEmail;
      expect(component.user.email.length).toBeGreaterThan(100);
    });

    it('should handle very long password', () => {
      const longPassword = 'P@ssw0rd!' + 'a'.repeat(100);
      component.user.password = longPassword;
      expect(component.user.password.length).toBeGreaterThan(100);
    });

    it('should handle special characters in name fields', () => {
      component.user.firstName = "O'Brien";
      component.user.lastName = 'Müller-Schmidt';
      expect(component.user.firstName).toBe("O'Brien");
      expect(component.user.lastName).toBe('Müller-Schmidt');
    });

    it('should handle empty description for PUP', () => {
      component.user.role = Role.ROLE_PUP;
      component.user.description = '';
      expect(component.user.description).toBe('');
    });

    it('should handle very long description', () => {
      const longDescription = 'a'.repeat(5000);
      component.user.description = longDescription;
      expect(component.user.description.length).toBe(5000);
    });

    it('should handle international phone numbers', () => {
      component.user.phoneNumber = '+1-555-123-4567';
      expect(component.user.phoneNumber).toBe('+1-555-123-4567');
    });

    it('should handle empty optional address fields', () => {
      component.user.address.country = '';
      component.user.address.city = '';
      component.user.address.street = '';
      component.user.address.zipCode = '';

      expect(component.user.address.country).toBe('');
      expect(component.user.address.city).toBe('');
      expect(component.user.address.street).toBe('');
      expect(component.user.address.zipCode).toBe('');
    });
  });

  // ============================================
  // 5. DATA SUBMISSION TESTS - Success scenarios
  // ============================================
  describe('5. Data submission - Success scenarios', () => {
    it('should call AuthService.register with correct FormData for ROLE_USER', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'User registered successfully',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_USER;
      component.user.email = 'user@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Petar';
      component.user.lastName = 'Petrovic';
      component.user.phoneNumber = '+381601234567';
      component.user.address.country = 'Serbia';
      component.user.address.city = 'Novi Sad';
      component.user.address.street = 'Bulevar Oslobodjenja 1';
      component.user.address.zipCode = '21000';

      component.onSubmit();

      expect(component.isSubmitting).toBe(false);
      expect(authService.register).toHaveBeenCalled();

      // Check that FormData was passed
      const callArgs = authService.register.calls.first().args[0];
      expect(callArgs instanceof FormData).toBe(true);

      setTimeout(() => {
        expect(notificationService.success).toHaveBeenCalledWith(
          'User registered successfully'
        );
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });

    it('should call AuthService.register with correct FormData for ROLE_OD', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'Organizer registered successfully',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_OD;
      component.user.email = 'organizer@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Ana';
      component.user.lastName = 'Jovanovic';
      component.user.phoneNumber = '+381601111111';

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      const callArgs = authService.register.calls.first().args[0];
      expect(callArgs instanceof FormData).toBe(true);

      setTimeout(() => {
        expect(notificationService.success).toHaveBeenCalledWith(
          'Organizer registered successfully'
        );
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });

    it('should call AuthService.register with correct FormData for ROLE_PUP including description', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'Provider registered successfully',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_PUP;
      component.user.email = 'provider@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';
      component.user.firstName = 'Best Events DOO';
      component.user.phoneNumber = '+381602222222';
      component.user.description = 'Professional event services provider';

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      const callArgs = authService.register.calls.first().args[0];
      expect(callArgs instanceof FormData).toBe(true);

      setTimeout(() => {
        expect(notificationService.success).toHaveBeenCalledWith(
          'Provider registered successfully'
        );
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });

    it('should set isSubmitting to true during registration', () => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_USER;
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      // isSubmitting is set to false after subscribe
      expect(authService.register).toHaveBeenCalled();
    });

    it('should clear registrationError on successful submission', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.registrationError = 'Previous error';
      component.user.role = Role.ROLE_USER;
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      setTimeout(() => {
        expect(component.registrationError).toBe('');
        done();
      }, 100);
    });
  });

  // ============================================
  // 6. DATA SUBMISSION TESTS - Failure scenarios
  // ============================================
  describe('6. Data submission - Failure scenarios', () => {
    it('should handle registration error with exception in response', (done) => {
      const mockResponse: RegisterResponse = {
        message: '',
        exception: 'Email already exists',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_USER;
      component.user.email = 'existing@test.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      setTimeout(() => {
        expect(component.isSubmitting).toBe(false);
        expect(component.registrationError).toBe('Email already exists');
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle HTTP error during registration', (done) => {
      const errorResponse = {
        status: 500,
        message: 'Internal Server Error',
      };
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.user.role = Role.ROLE_USER;
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      setTimeout(() => {
        expect(component.isSubmitting).toBe(false);
        expect(component.registrationError).toBe('Registration failed.');
        expect(notificationService.error).toHaveBeenCalledWith(
          'Registration failed. Please try again.'
        );
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle network error during registration', (done) => {
      authService.register.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      component.user.role = Role.ROLE_USER;
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      setTimeout(() => {
        expect(component.isSubmitting).toBe(false);
        expect(notificationService.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  // ============================================
  // 7. FILE UPLOAD TESTS
  // ============================================
  describe('7. File upload', () => {
    it('should handle single file selection for ROLE_USER', () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      };

      component.onFileSelectedSingle(mockEvent);

      expect(component.filesForUpload.length).toBe(1);
      expect(component.filesForUpload[0]).toBe(mockFile);
    });

    it('should handle multiple file selection for ROLE_OD', () => {
      const mockFile1 = new File(['portfolio1'], 'portfolio1.jpg', {
        type: 'image/jpeg',
      });
      const mockFile2 = new File(['portfolio2'], 'portfolio2.jpg', {
        type: 'image/jpeg',
      });
      const mockEvent = {
        target: {
          files: [mockFile1, mockFile2],
        },
      };

      component.onFilesSelectedMultiple(mockEvent);

      expect(component.filesForUpload.length).toBe(2);
      expect(component.filesForUpload[0]).toBe(mockFile1);
      expect(component.filesForUpload[1]).toBe(mockFile2);
    });

    it('should handle multiple file selection for ROLE_PUP', () => {
      const mockFile1 = new File(['company1'], 'company1.jpg', {
        type: 'image/jpeg',
      });
      const mockFile2 = new File(['company2'], 'company2.jpg', {
        type: 'image/jpeg',
      });
      const mockFile3 = new File(['company3'], 'company3.jpg', {
        type: 'image/jpeg',
      });
      const mockEvent = {
        target: {
          files: [mockFile1, mockFile2, mockFile3],
        },
      };

      component.onFilesSelectedMultiple(mockEvent);

      expect(component.filesForUpload.length).toBe(3);
    });

    it('should reset previous files when selecting new single file', () => {
      const mockFile1 = new File(['old'], 'old.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['new'], 'new.jpg', { type: 'image/jpeg' });

      component.onFileSelectedSingle({ target: { files: [mockFile1] } });
      expect(component.filesForUpload.length).toBe(1);

      component.onFileSelectedSingle({ target: { files: [mockFile2] } });
      expect(component.filesForUpload.length).toBe(1);
      expect(component.filesForUpload[0]).toBe(mockFile2);
    });

    it('should remove picture by index', () => {
      const mockFile1 = new File(['img1'], 'img1.jpg', {
        type: 'image/jpeg',
      });
      const mockFile2 = new File(['img2'], 'img2.jpg', {
        type: 'image/jpeg',
      });

      component.filesForUpload = [mockFile1, mockFile2];
      component.previewUrls = ['url1', 'url2'];

      component.removePicture(0);

      expect(component.filesForUpload.length).toBe(1);
      expect(component.filesForUpload[0]).toBe(mockFile2);
      expect(component.previewUrls.length).toBe(1);
      expect(component.previewUrls[0]).toBe('url2');
    });

    it('should handle empty file selection', () => {
      const mockEvent = {
        target: {
          files: [],
        },
      };

      const initialLength = component.filesForUpload.length;
      component.onFileSelectedSingle(mockEvent);

      // Files should not change
      expect(component.filesForUpload.length).toBe(initialLength);
    });

    it('should include uploaded files in FormData when registering', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      const mockFile = new File(['avatar'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      component.filesForUpload = [mockFile];

      component.user.role = Role.ROLE_USER;
      component.user.email = 'test@example.com';
      component.user.password = 'Password123!';
      component.confirmPassword = 'Password123!';

      component.onSubmit();

      expect(authService.register).toHaveBeenCalled();
      const formData = authService.register.calls.first().args[0];
      expect(formData instanceof FormData).toBe(true);

      setTimeout(() => {
        done();
      }, 100);
    });
  });

  // ============================================
  // 8. INTEGRATION TESTS - Complete registration flow
  // ============================================
  describe('8. Integration tests - Complete registration flow', () => {
    it('should complete full registration flow for ROLE_USER with all data', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'User successfully registered',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      // Filling the complete form
      component.user.role = Role.ROLE_USER;
      component.user.email = 'full.user@test.com';
      component.user.password = 'SecurePass123!';
      component.confirmPassword = 'SecurePass123!';
      component.user.firstName = 'Milan';
      component.user.lastName = 'Milanovic';
      component.user.phoneNumber = '+381601234567';
      component.user.address.country = 'Serbia';
      component.user.address.city = 'Novi Sad';
      component.user.address.street = 'Bulevar Oslobodjenja 46';
      component.user.address.zipCode = '21000';

      const mockFile = new File(['avatar'], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      component.filesForUpload = [mockFile];

      component.onSubmit();

      setTimeout(() => {
        expect(component.isSubmitting).toBe(false);
        expect(authService.register).toHaveBeenCalled();
        expect(notificationService.success).toHaveBeenCalledWith(
          'User successfully registered'
        );
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });

    it('should complete full registration flow for ROLE_PUP with description', (done) => {
      const mockResponse: RegisterResponse = {
        message: 'Provider successfully registered',
        exception: '',
      };
      authService.register.and.returnValue(of(mockResponse));

      component.user.role = Role.ROLE_PUP;
      component.user.email = 'best.provider@test.com';
      component.user.password = 'ProviderPass123!';
      component.confirmPassword = 'ProviderPass123!';
      component.user.firstName = 'Event Solutions DOO';
      component.user.phoneNumber = '+381113334455';
      component.user.description =
        'We provide comprehensive event planning services including catering, decoration, and entertainment.';
      component.user.address.country = 'Serbia';
      component.user.address.city = 'Belgrade';
      component.user.address.street = 'Kralja Petra 15';
      component.user.address.zipCode = '11000';

      const mockFiles = [
        new File(['company1'], 'company1.jpg', { type: 'image/jpeg' }),
        new File(['company2'], 'company2.jpg', { type: 'image/jpeg' }),
      ];
      component.filesForUpload = mockFiles;

      component.onSubmit();

      setTimeout(() => {
        expect(authService.register).toHaveBeenCalled();
        expect(notificationService.success).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 100);
    });
  });
});
