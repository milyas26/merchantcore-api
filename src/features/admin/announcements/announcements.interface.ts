export interface AnnouncementWithCreator {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  type: string;
  createdBy: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnnouncementsResponse {
  data: AnnouncementWithCreator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AnnouncementResponse {
  data: AnnouncementWithCreator;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
