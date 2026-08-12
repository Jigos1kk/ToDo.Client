export type MembershipStatus = 'Pending' | 'Approved' | 'Rejected';

/** Заявка на участие в проекте. */
export interface Membership {
  id: string;
  projectId: string;
  userId: string;
  status: MembershipStatus;
  createdAt: string;
  processedAt: string | null;
}
