// web/hooks/useLiveStatsPolling.ts

import { useState, useEffect, useCallback } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import axios from 'axios';
import { subscribeToServerChanges } from '../src/api/serverEvents';

// Inferred structure for live stats (Page 28 OCR)
interface LiveStats {
    totalVoters: number;
    totalVotesCast: number;
    voterTurnout: number; // float
    positionsWithStats: any[];
    isLive: boolean;
    // The API doesn't provide granular data like hourlyTurnout or stationStatus,
    // so we'll only rely on what's available.
}

interface LiveStatsState {
    stats: LiveStats | null;
    isLoading: boolean;
    error: string | null;
    statusMessage: string | null;
}

export const useLiveStatsPolling = (): LiveStatsState => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await sjbuApi.get('/results');
            setStats(response.data.data);
            setError(null);
            setStatusMessage(null);
        } catch (e) {
            if (axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403)) {
                setStats(null);
                setError(null);
                setStatusMessage('Live results are available only while voting is open. Final results will appear after the official announcement.');
            } else {
                let message = 'Failed to load live statistics.';
                if (axios.isAxiosError(e) && e.response) {
                    const status = e.response.status;
                    if (status >= 500) {
                        message = `Server Error (${status}). Data temporarily unavailable.`;
                    } else if (status === 404) {
                        message = 'Statistics service not found on the server.';
                    } else {
                        message = `Server Error (${status}). Data not available.`;
                    }
                }
                setError(message);
                console.error('Fetch Live Stats Error:', e);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const unsubscribe = subscribeToServerChanges(sjbuApi, (change) => {
            if (change === 'votes' || change === 'election' || change === 'schedule') fetchStats();
        });
        const scheduleCheck = window.setInterval(fetchStats, 30000);
        return () => {
            unsubscribe();
            window.clearInterval(scheduleCheck);
        };
    }, [fetchStats]);

    return { stats, isLoading, error, statusMessage };
};