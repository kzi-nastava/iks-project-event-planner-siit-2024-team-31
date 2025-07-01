export interface EventAnalytics {
  eventId: number;
  eventName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  attendance: AttendanceData;
  ratings: RatingData;
  demographics: DemographicsData;
  registrationTrend: RegistrationTrendData[];
}

export interface AttendanceData {
  registered: number;
  attended: number;
  noShow: number;
  attendanceRate: number; // percentage
}

export interface RatingData {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution[];
}

export interface RatingDistribution {
  rating: number; // 1-5 stars
  count: number;
  percentage: number;
}

export interface DemographicsData {
  ageGroups: AgeGroupData[];
  genderDistribution: GenderData[];
  locationDistribution: LocationData[];
}

export interface AgeGroupData {
  ageRange: string; // e.g., "18-25", "26-35"
  count: number;
  percentage: number;
}

export interface GenderData {
  gender: string;
  count: number;
  percentage: number;
}

export interface LocationData {
  location: string;
  count: number;
  percentage: number;
}

export interface RegistrationTrendData {
  date: string;
  registrations: number;
  cumulativeRegistrations: number;
}

export interface EventAnalyticsSummary {
  eventId: number;
  eventName: string;
  totalRegistrations: number;
  totalAttendees: number;
  averageRating: number;
  attendanceRate: number;
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
}
