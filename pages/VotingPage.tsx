// web/pages/VotingPage.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page, Candidate, Position } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import sjbuApi from '../src/api/sjbuApi';
import useElectionSchedule from '../hooks/useElectionSchedule';
import { CANDIDATE_IMAGE_PLACEHOLDER, handleCandidateImageError } from '../src/utils/candidateImage';

interface VoteSelection {
  [positionId: number]: number;
}

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

interface VotingPageProps {
  positions: PositionWithCandidates[];
  userVoucher: string;
  setPage: (page: Page) => void;
  setVerificationCode: (code: string) => void;
  isOffline: boolean;
}

const VotingPage: React.FC<VotingPageProps> = ({
  positions,
  userVoucher,
  setPage,
  setVerificationCode,
  isOffline,
}) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selections, setSelections] = useState<VoteSelection>({});
  const [view, setView] = useState<'voting' | 'review'>('voting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManifestoModalOpen, setIsManifestoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);

  const { schedule, phase, loading: scheduleLoading } = useElectionSchedule();

  // Load saved selections
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dmi-vote-selections');
      if (saved) {
        const parsed = JSON.parse(saved);
        const numeric: VoteSelection = {};
        Object.keys(parsed).forEach(key => {
          const val = parsed[key];
          if (typeof val === 'number') {
            numeric[parseInt(key, 10)] = val;
          }
        });
        setSelections(numeric);
      }
    } catch (err) {
      console.error('Failed to load saved selections', err);
    }
  }, []);

  // Save selections
  useEffect(() => {
    try {
      localStorage.setItem('dmi-vote-selections', JSON.stringify(selections));
    } catch (err) {
      console.error('Failed to save selections', err);
    }
  }, [selections]);

  const ballotPositions = positions.filter(position => position.isVotable !== false);
  const currentPosition = ballotPositions[currentPositionIndex];

  const handleSelect = (candidateId: number) => {
    setSelections(prev => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }));
  };

  const handleNext = () => {
    if (currentPositionIndex < ballotPositions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    } else {
      if (ballotPositions.some(position => !selections[position.id])) {
        alert('Please select a candidate for every votable position.');
        return;
      }
      setView('review');
    }
  };

  const handleBack = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

const handleSubmit = async () => {
  if (scheduleLoading) {
    alert('Please wait — election schedule is loading.');
    return;
  }
  if (phase !== 'LIVE') {
    alert('Voting is not currently open.');
    return;
  }
  if (isOffline) {
    alert('You are offline. Reconnect to submit your vote.');
    return;
  }
  if (ballotPositions.length === 0 || ballotPositions.some(position => !selections[position.id])) {
    alert('You must select a candidate for every votable position.');
    return;
  }

  setIsSubmitting(true);
  setIsConfirmModalOpen(false);

  try {
    const candidateIds = ballotPositions.map(position => selections[position.id]);
    const response = await sjbuApi.post('/vote', {
      voucher: userVoucher,
      candidateIds,
    });

    const verificationCode = response.data?.data?.verificationCode;

    if (!verificationCode) {
      console.warn('Vote succeeded but no verification code found', response.data);
      alert('Your vote was recorded successfully, but no verification code was received. Contact an admin if needed.');
      localStorage.removeItem('dmi-vote-selections');
      setPage(Page.Home);
      return;
    }

    setVerificationCode(verificationCode);
    localStorage.removeItem('dmi-vote-selections');
    setPage(Page.VoteSuccess);

  } catch (err: any) {
    console.error('Submission failed:', err);

    let message = 'Failed to submit vote. Please try again.';

    // Handle specific error scenarios
    if (err.response?.status === 409) {
      message = 'You have already submitted a ballot using this voucher.';
    } else if (err.response?.status === 500) {
      const errorMsg = err.response?.data?.error || '';
      
      if (errorMsg.includes('Database corruption')) {
        message = '⚠️ There is an issue with your voting record. Please contact support immediately with your voucher code.';
      } else if (errorMsg) {
        message = errorMsg;
      }
    } else if (err.response?.data?.error) {
      message = err.response.data.error;
    } else if (err.message) {
      message = err.message;
    }

    alert(message);
  } finally {
    setIsSubmitting(false);
  }
};
  const openManifesto = (candidate: Candidate) => {
    setModalCandidate(candidate);
    setIsManifestoModalOpen(true);
  };

  // Loading & Phase Checks
  if (scheduleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Loading schedule…</h2>
        </Card>
      </div>
    );
  }

  if (phase !== 'LIVE') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold">Voting is {phase === 'PRE' ? 'not yet open' : 'closed'}</h2>
        </Card>
      </div>
    );
  }

  if (ballotPositions.length === 0 || ballotPositions.some(position => position.candidates.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Ballot is not ready</h2>
          <p className="mt-2 text-gray-600">There are no candidates for one or more votable positions. Please contact an election administrator.</p>
        </Card>
      </div>
    );
  }

  if (!currentPosition) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-4xl mx-auto p-6">
          <h2 className="text-xl font-bold text-dmi-blue-900">Loading election data…</h2>
        </Card>
      </div>
    );
  }

  const renderVotingView = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <p className="text-sm text-gray-500">Position {currentPositionIndex + 1} of {ballotPositions.length}</p>
        <h2 className="text-2xl font-bold text-dmi-blue-900">{currentPosition.name}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div
            className="bg-dmi-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${((currentPositionIndex + 1) / ballotPositions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {currentPosition.candidates.map(candidate => (
          <div
            key={candidate.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selections[currentPosition.id] === candidate.id
                ? 'bg-dmi-blue-50 border-dmi-blue-500 ring-2 ring-dmi-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelect(candidate.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={candidate.imageUrl?.trim() || CANDIDATE_IMAGE_PLACEHOLDER} alt={candidate.name} onError={handleCandidateImageError} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h4 className="text-lg font-semibold text-dmi-blue-900">{candidate.name}</h4>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openManifesto(candidate); }}>
                    View Manifesto
                  </Button>
                </div>
              </div>
              {selections[currentPosition.id] === candidate.id && (
                <svg className="w-8 h-8 text-dmi-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 flex justify-between">
        <Button variant="secondary" onClick={handleBack} disabled={currentPositionIndex === 0}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!selections[currentPosition.id]}>
          {currentPositionIndex < ballotPositions.length - 1 ? 'Next' : 'Review Ballot'}
        </Button>
      </div>
    </Card>
  );

  const renderReviewView = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6 border-b text-center">
        <h2 className="text-2xl font-bold text-dmi-blue-900">Review Your Ballot</h2>
        <p className="text-gray-600 mt-2">Once submitted, your vote cannot be changed.</p>
      </div>

      <div className="p-6 space-y-4">
        {ballotPositions.map(pos => {
          const selected = pos.candidates.find(c => c.id === selections[pos.id]);
          return (
            <div key={pos.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-dmi-blue-800">{pos.name}</p>
                <p className="text-lg">{selected?.name || 'No selection'}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => {
                setCurrentPositionIndex(ballotPositions.findIndex(p => p.id === pos.id));
                setView('voting');
              }}>
                Change
              </Button>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-gray-50 flex justify-between">
        <Button variant="secondary" onClick={() => setView('voting')}>
          Back to Ballot
        </Button>
        <Button onClick={() => setIsConfirmModalOpen(true)} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Submit Ballot'}
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center p-3 z-50">
          Offline — your progress is saved. Reconnect to submit.
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {view === 'voting' && renderVotingView()}
        {view === 'review' && renderReviewView()}

        <Modal isOpen={isManifestoModalOpen} onClose={() => setIsManifestoModalOpen(false)} title="Manifesto">
          <p className="whitespace-pre-wrap">{modalCandidate?.manifesto}</p>
        </Modal>

        <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Submission">
          <div className="text-center">
            <p className="my-4">This action is final. Submit your vote?</p>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : 'Yes, Submit Vote'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default VotingPage;