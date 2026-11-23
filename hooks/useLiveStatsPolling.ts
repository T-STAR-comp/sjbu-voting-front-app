// web/hooks/useLiveStatsPolling.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios';
import { subscribeToServerChanges } from '../src/api/serverEvents';

// Inferred structure for live stats (Page 28 OCR)
interface LiveStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number; // float
    positionsWithStats: any[];
    // The API doesn't provide granular data like hourlyTurnout or stationStatus,
    // so we'll only rely on what's available.
}

interface LiveStatsState {
    stats: LiveStats | null;
    isLoading: boolean;
    error: string | null;
}

export const useLiveStatsPolling = (): LiveStatsState => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resultsPublished = useRef(false);

    const fetchStats = useCallback(async () => {
        
        try {
            const response = await sjbuApi.get('/results');
            setStats(response.data.data);
            resultsPublished.current = true;
            setError(null);
        } catch (e) {
            let message = 'Failed to load live statistics.';
            
            if (axios.isAxiosError(e) && e.response) { 
                 const status = e.response.status;

                 // FINAL FIX: Treat 401/403 as a public restriction/data not yet ready, not a fatal error
                 if (status === 401 || status === 403) {
                     resultsPublished.current = false;
                     message = 'Results have not been published yet.';
                 } else if (status >= 500) {
                     message = `Server Error (${status}). Data temporarily unavailable.`;
                 } else if (status === 404) {
                     message = 'Statistics service not found on the server.';
                 }
            }
            setError(message);
            console.error('Fetch Live Stats Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        return subscribeToServerChanges(sjbuApi, (change) => {
            if (change === 'election' || (change === 'votes' && resultsPublished.current)) fetchStats();
        });
    }, [fetchStats]);

    return { stats, isLoading, error };
};