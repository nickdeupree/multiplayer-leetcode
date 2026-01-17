import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Problem } from '@/app/components/lobby/problem-table';

export type User = {
    id: number;
    name: string;
    color: string;
    isReady: boolean;
};

export const useYjsLobby = (lobbyId: string, participate: boolean = true) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [hostId, setHostId] = useState<number | null>(null);

    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);

    useEffect(() => {
        if (!lobbyId) return;

        // Use a fresh Doc
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:1234';
        console.log('[useYjsLobby] Connecting to WebSocket URL:', wsUrl, 'Lobby:', lobbyId);

        const provider = new WebsocketProvider(
            wsUrl,
            `lobby-${lobbyId}`,
            ydoc
        );
        providerRef.current = provider;

        const awareness = provider.awareness;

        provider.on('status', (event: any) => {
            console.log('[useYjsLobby] Connection status:', event.status);
        });

        provider.on('connection-error', (event: any) => {
            console.error('[useYjsLobby] Connection error:', event);
        });

        if (participate) {
            // Try to recover state from localStorage
            let initialName = '';
            let initialColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

            try {
                const saved = localStorage.getItem('multiplayer-leetcode-user');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.name) initialName = parsed.name;
                    if (parsed.color) initialColor = parsed.color;
                }
            } catch (e) {
                console.warn('Failed to load user state', e);
            }

            // Save the possibly new random color
            try {
                localStorage.setItem('multiplayer-leetcode-user', JSON.stringify({ name: initialName, color: initialColor }));
            } catch (e) {
                // ignore
            }

            awareness.setLocalStateField('user', {
                name: initialName,
                color: initialColor,
                isReady: false
            });
        }

        // Handle Awareness Changes
        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const userList: User[] = [];

            states.forEach((state: any, clientId: number) => {
                if (state.user) {
                    userList.push({
                        id: clientId,
                        name: state.user.name || `User ${clientId}`, // Fallback
                        color: state.user.color,
                        isReady: state.user.isReady || false,
                    });
                }
            });

            // Sort by join time
            userList.sort((a, b) => a.id - b.id);
            setUsers(userList);

            if (participate) {
                const myId = awareness.clientID;
                const me = userList.find(u => u.id === myId);
                if (me) setCurrentUser(me);
            }
        };

        awareness.on('change', handleAwarenessChange);
        // Initial fetch
        handleAwarenessChange();

        // Shared Map for Lobby State
        const lobbyStateMap = ydoc.getMap('lobbyState');

        // Set host as first person to join (if not already set)
        if (participate) {
            provider.on('sync', (isSynced: boolean) => {
                if (isSynced) {
                    const existingHostId = lobbyStateMap.get('hostId');
                    if (existingHostId === undefined || existingHostId === null) {
                        // No host yet, claim it
                        lobbyStateMap.set('hostId', awareness.clientID);
                    }
                }
            });
        }

        const handleMapChange = () => {
            const problem = lobbyStateMap.get('selectedProblem') as Problem | null;
            const started = lobbyStateMap.get('isGameStarted') as boolean;
            const host = lobbyStateMap.get('hostId') as number | null;

            if (problem) setSelectedProblem(problem);
            if (started !== undefined) setIsGameStarted(started);
            if (host !== undefined) setHostId(host);
        };

        lobbyStateMap.observe(handleMapChange);
        // Initial fetch from map
        handleMapChange();

        return () => {
            awareness.off('change', handleAwarenessChange);
            lobbyStateMap.unobserve(handleMapChange);
            provider.disconnect();
            provider.destroy();
            ydoc.destroy();
        };
    }, [lobbyId, participate]);

    const updateName = useCallback((name: string) => {
        if (!providerRef.current) return;
        const awareness = providerRef.current.awareness;
        const currentState = awareness.getLocalState();

        // Persist to localStorage
        try {
            const userState = {
                name,
                color: currentState?.user?.color
            };
            localStorage.setItem('multiplayer-leetcode-user', JSON.stringify(userState));
        } catch (e) {
            // ignore
        }

        awareness.setLocalStateField('user', {
            ...currentState?.user,
            name
        });
    }, []);

    const toggleReady = useCallback(() => {
        if (!providerRef.current) return;
        const awareness = providerRef.current.awareness;
        const currentState = awareness.getLocalState();
        const isReady = currentState?.user?.isReady || false;
        awareness.setLocalStateField('user', {
            ...currentState?.user,
            isReady: !isReady
        });
    }, []);

    const selectProblem = useCallback((problem: Problem) => {
        if (!ydocRef.current) return;
        const map = ydocRef.current.getMap('lobbyState');
        map.set('selectedProblem', problem);
    }, []);

    const startGame = useCallback(() => {
        if (!ydocRef.current) return;
        const map = ydocRef.current.getMap('lobbyState');
        map.set('isGameStarted', true);
    }, []);

    // Host derivation: Use hostId from state
    const isHost = currentUser?.id === hostId;

    return {
        users,
        currentUser,
        selectedProblem,
        isGameStarted,
        isHost,
        updateName,
        toggleReady,
        selectProblem,
        startGame
    };
};
