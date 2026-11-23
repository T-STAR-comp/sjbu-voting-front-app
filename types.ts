// web/types.ts

export enum Page {
  Intro,
  Home,
  StudentLogin,
  Authentication,
  Voting,
  VoteSuccess,
  Verification,
  Results,
  Winners,
  AdminLogin,
  Admin,
  CandidateGallery,     
  HowToVote,            
  TermsOfUse,           
  PrivacyPolicy,        
  ContactHelp,  
  MeetTheTeam         
}

export interface StudentPortalUser {
  id: number;
  fullName: string;
  studentId: string;
  email: string;
  password: string;
  faculty: string;
  year: string;
}

export type AdminRole = string;

export interface AdminUser {
  id: number;
  username: string;
  role: AdminRole;
  permissions: string[];
  email: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  password?: string;
}

export interface Candidate {
  id: number;
  name: string;
  imageUrl: string;
  manifesto: string;
}

export interface Position {
  id: number;
  name: string;
  isVotable?: boolean;
  runnerUpIsVice?: boolean;
  candidates: Candidate[];
  totalVotes?: number;
  voterTurnout?: number;
}

export interface VoteSelection {
  [positionId: number]: number | 'abstain';
}

export interface CandidateStats {
    candidateId: number;
    candidateName: string;
    manifesto?: string;
    voteCount: number;
    votePercentage: number;
}

export interface PositionStats {
    positionId: number;
    positionName: string;
    totalCandidates: number;
    totalVotes: number;
    voterTurnout: number;
    candidates: CandidateStats[];
}

export interface OverallStats {
    totalPositions: number;
    totalCandidates: number;
    averageVotesPerPosition?: number;
    mostVotedPosition?: string;
    leastVotedPosition?: string;
}

export interface VotingStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number;
    positionsWithStats: PositionStats[];
    overallStats: OverallStats;
}

export type ElectionStatus = 'PRE_ELECTION' | 'LIVE' | 'POST_ELECTION';

export interface AuditLogEntry {
  id: number;
  timestamp: Date;
  adminUsername: string;
  action: string;
  details: string;
  ipAddress: string;
}