import {CommonModule} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from '../../../services/auth/auth.service';
import {UserService} from '../../../services/user/user.service';
import {
  UpdateUserDataRequest
} from '../../../types/dto/requests/updateUserDataRequest';
import {
  UserMyProfileResponse
} from '../../../types/dto/responses/userMyProfileResponse';
import {Role} from "../../../types/roles";

@Component({
	selector: 'app-edit-profile-form-component',
	imports: [CommonModule, FormsModule],
	providers: [UserService, AuthService],
	templateUrl: './edit-profile-form-component.component.html',
	standalone: true,
})
export class EditProfileFormComponent implements OnInit, OnChanges {
	constructor(
		private userService: UserService,
		private authService: AuthService,
		private sanitizer: DomSanitizer
	) {
	}

	tempUser: UserMyProfileResponse | null = null;
	role: Role | null = null;
	removedPhotosIds: number[] = [];
	newPhotos: { file: File; preview: SafeUrl }[] = [];

	ngOnInit(): void {
		this.role = this.authService.getRole();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['showModal'] && this.showModal) {
			this.initializeForm();
		}
	}

	initializeForm(): void {
		this.tempUser = {
			email: this.userProfileData?.email || '',
			firstName: this.userProfileData?.firstName || '',
			lastName: this.userProfileData?.lastName || '',
			phoneNumber: this.userProfileData?.phoneNumber || '',
			country: this.userProfileData?.country || '',
			city: this.userProfileData?.city || '',
			zipCode: this.userProfileData?.zipCode || '',
			address: this.userProfileData?.address || '',
			description: this.userProfileData?.description || '',
			tempPhotoUrlAndIdDTOList:
				this.userProfileData?.tempPhotoUrlAndIdDTOList?.map((i) => ({
					...i,
				})) || [],
			error: this.userProfileData?.error || '',
			message: this.userProfileData?.message || '',
		};
		this.removedPhotosIds = [];
		this.newPhotos = [];
	}

	@Input() userProfileData: UserMyProfileResponse | null = null;
	@Input() showModal = false;
	@Output() closeModal = new EventEmitter<void>();

	removePhoto(id: number): void {
		if (this.tempUser?.tempPhotoUrlAndIdDTOList) {
			this.tempUser.tempPhotoUrlAndIdDTOList =
				this.tempUser.tempPhotoUrlAndIdDTOList.filter(
					(photo) => photo.photoId !== id
				);
			this.removedPhotosIds.push(id);
		}
	}

	onPhotoUpload(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			for (const file of Array.from(input.files)) {
				const preview = this.sanitizer.bypassSecurityTrustUrl(
					URL.createObjectURL(file)
				);
				this.newPhotos.push({file, preview});
			}
		}
	}

	onAvatarUpload(event: Event): void {
		const input = event.target as HTMLInputElement;

		if (input.files?.length) {
			if (
				this.role === Role.ROLE_USER &&
				this.tempUser?.tempPhotoUrlAndIdDTOList?.length
			) {
				const currentAvatar = this.tempUser.tempPhotoUrlAndIdDTOList[0];
				if (currentAvatar.photoId) {
					this.removedPhotosIds.push(currentAvatar.photoId);
				}
			}

			this.newPhotos = [];

			const file = input.files[0];
			const preview = this.sanitizer.bypassSecurityTrustUrl(
				URL.createObjectURL(file)
			);
			this.newPhotos.push({file, preview});
		}
	}

	removeNewPhoto(file: File): void {
		this.newPhotos = this.newPhotos.filter((photo) => photo.file !== file);
	}

	closeModalWindow() {
		this.closeModal.emit();
	}

	onSubmit() {
		if (!this.tempUser) return;

		const updateProfileRequest: UpdateUserDataRequest = {
			email: this.tempUser.email,
			firstName: this.tempUser.firstName,
			lastName: this.tempUser.lastName,
			phoneNumber: this.tempUser.phoneNumber,
			country: this.tempUser.country,
			city: this.tempUser.city,
			zipCode: this.tempUser.zipCode,
			address: this.tempUser.address,
			description: this.tempUser.description,
			deletedPhotosIds: this.removedPhotosIds,
		};

		const formData = new FormData();

		Object.entries(updateProfileRequest).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				value.forEach((item) => formData.append(key, item.toString()));
			} else if (value !== undefined && value !== null) {
				formData.append(key, value.toString());
			}
		});

		for (const photo of this.newPhotos) {
			formData.append('photos', photo.file);
		}

		this.userService.updateUserData(formData).subscribe({
			next: (response) => {
				alert('Profile updated successfully!');
				this.profileUpdated.emit();
				this.closeModal.emit();
			},
			error: (error) => {
				console.error('Error updating profile:', error);
			},
		});
	}

	@Output() profileUpdated = new EventEmitter<void>();
	protected readonly Role = Role;
}
