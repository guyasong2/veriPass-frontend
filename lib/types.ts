export type UserRole = 'artisan' | 'admin';

export type VerificationLevel =
  | 'Draft'
  | 'Under Review'
  | 'ID Verified'
  | 'Work Confirmed'
  | 'Trusted'
  | 'Rejected'
  | 'Suspended';

export type IdentityStatus = 'not_started' | 'pending' | 'verified' | 'failed';
export type AccountStatus = 'active' | 'suspended' | 'rejected';
export type ReferenceStatus = 'invited' | 'confirmed' | 'declined';
export type Relationship =
  | 'client'
  | 'fellow_artisan'
  | 'employer'
  | 'supervisor';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  artisanId?: string | null;
  verificationLevel?: VerificationLevel | string | null;
  accountStatus?: AccountStatus | string | null;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}

export interface ReferenceCounts {
  confirmed: number;
  fellowArtisans: number;
  invited: number;
  declined: number;
  total: number;
}

export interface NextLevel {
  target: VerificationLevel;
  hint: string;
}

export interface Checklist {
  account: boolean;
  identity: boolean;
  profile: boolean;
  evidence: boolean;
  references: boolean;
}

export interface EvidenceItem {
  id: string;
  artisanId: string;
  url: string;
  caption: string;
  createdAt: string;
}

export interface ReferenceItem {
  id: string;
  artisanId: string;
  name: string;
  contact: string;
  relationship: Relationship;
  token: string;
  status: ReferenceStatus;
  comment?: string | null;
  rating?: number | null;
  respondedAt?: string | null;
  createdAt: string;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  trade: string;
  bio: string;
  location: string;
  yearsExperience: number;
  availability: string;
  avatarUrl?: string | null;
  identityStatus: IdentityStatus;
  identityVerifiedAt?: string | null;
  diditSessionId?: string | null;
  verificationLevel: VerificationLevel;
  accountStatus: AccountStatus;
  verificationCode: string;
  submittedForReviewAt?: string | null;
  profileViews: number;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceItem[];
  references: ReferenceItem[];
  counts: ReferenceCounts;
  checklist: Checklist;
  progress: number;
  nextLevel: NextLevel;
}

export interface PublicConfirmedReference {
  name: string;
  relationship: Relationship;
  comment?: string | null;
  rating?: number | null;
  respondedAt?: string | null;
}

export interface PublicArtisan {
  fullName: string;
  trade: string;
  bio: string;
  location: string;
  yearsExperience: number;
  availability: string;
  avatarUrl?: string | null;
  identityStatus: IdentityStatus;
  identityVerifiedAt?: string | null;
  verificationLevel: VerificationLevel;
  accountStatus: AccountStatus;
  verificationCode: string;
  memberSince: string;
  lastCheckedAt: string;
  profileViews: number;
  counts: ReferenceCounts;
  evidence: EvidenceItem[];
  confirmedReferences: PublicConfirmedReference[];
}

export interface PublicVerifyResponse {
  found: boolean;
  verified: boolean;
  artisan: PublicArtisan;
}

export interface ReferenceInvite {
  artisan: {
    fullName: string;
    trade: string;
    location: string;
    avatarUrl?: string | null;
    verificationLevel: VerificationLevel;
    verificationCode: string;
    identityVerifiedAt?: string | null;
  };
  reference: {
    name: string;
    relationship: Relationship;
    status: ReferenceStatus;
    comment?: string | null;
    rating?: number | null;
    respondedAt?: string | null;
    createdAt?: string | null;
  };
  canRespond: boolean;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  detail: string;
  targetArtisanId?: string | null;
  targetName?: string | null;
  createdAt: string;
}

export interface AdminArtisanSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  trade: string;
  location: string;
  avatarUrl?: string | null;
  identityStatus: IdentityStatus;
  verificationLevel: VerificationLevel;
  accountStatus: AccountStatus;
  verificationCode: string;
  createdAt: string;
  submittedForReviewAt?: string | null;
  evidenceCount: number;
  referenceCount: number;
  confirmedReferences: number;
  fellowArtisanReferences: number;
  profileViews: number;
}

export interface AdminDetail extends ArtisanProfile {
  activity: AuditEvent[];
}

export interface AdminStats {
  totals: {
    artisans: number;
    active: number;
    verified: number;
    trusted: number;
    pendingReview: number;
    suspended: number;
    rejected: number;
    draft: number;
    evidence: number;
    users: number;
    newThisWeek: number;
  };
  references: {
    total: number;
    confirmed: number;
    invited: number;
    declined: number;
    responseRate: number;
  };
  byLevel: Record<string, number>;
  tradeBreakdown: { trade: string; total: number; trusted: number }[];
  reviewQueue: AdminArtisanSummary[];
  recentActivity: AuditEvent[];
  generatedAt: string;
}

export interface AdminArtisanList {
  artisans: AdminArtisanSummary[];
  total: number;
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
  nextLevel?: NextLevel;
}
