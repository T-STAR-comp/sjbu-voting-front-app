// web/hooks/useResultsStats.ts

import { useCallback, useEffect, useState } from 'react';
import sjbuApi from '../src/api/sjbuApi';
import { subscribeToServerChanges } from '../src/api/serverEvents';

export interface ResultsStats {
    overall?: {
        totalVotes: number;
        eligibleVoters: number;
    };
    positions?: Array<{
            positionId: number;
            positionName: string;
            totalVotes: number;
            votes: Record<string, number>;
        }>;
    // optional auxiliary data for charts
    hourlyTurnout?: any[];
    stationStatus?: any[];
}

export const useResultsStats = () => {
    const [stats, setStats] = useState<ResultsStats | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStats = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await sjbuApi.get('/results', { signal });
            const data = response.data.data;
            const normalized: ResultsStats = {
                overall: {
                    totalVotes: data.totalVotesCast ?? 0,
                    eligibleVoters: data.totalVoters ?? 0,
                },
                positions: data.positions ?? {},
                hourlyTurnout: [],
                stationStatus: [],
            };
            setStats(normalized);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err);
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const ac = new AbortController();
        fetchStats(ac.signal);
        return () => ac.abort();
    }, [fetchStats]);

    useEffect(() => subscribeToServerChanges(sjbuApi, (change) => {
        if (change === 'votes' || change === 'election') fetchStats();
    }), [fetchStats]);

    return { stats, isLoading, error, refetch: fetchStats as (signal?: AbortSignal) => Promise<void> };
};

export default useResultsStats;