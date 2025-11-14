export interface Store {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreMembership {
  id: string;
  userId: string;
  storeId: string;
  role: MembershipRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum MembershipRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  VIEWER = "VIEWER"
}

export interface CreateStoreBody {
  name: string;
  description?: string;
}

export interface UpdateStoreBody {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface StoreResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  membership: {
    role: MembershipRole;
    createdAt: Date;
  } | undefined;
}

export interface StoreListResponse {
  stores: StoreResponse[];
  total: number;
}

export interface StoreParams {
  storeId: string;
}