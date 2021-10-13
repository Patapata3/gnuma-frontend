import React, {createContext, useCallback, useReducer} from 'react';

import {defaultErrorMessage, missingProviderError} from '../../util/presentation';
import LogsReducer, {initialState, LogEntry} from '../../state/logs/reducer';
import {getAllLogs} from '../../service/logService';
import {GenericPayloadState} from '../../state/common/reducer';


type LogsContextType = {
    state: GenericPayloadState<LogEntry>;
    onFetchAll: () => void;
    onFetchOne: () => void;
}

export const LogsContext = createContext<LogsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne')
});

type LogsContextPropsType = {
    children: React.ReactChildren | React.ReactNode;
}

const LogsContextProvider = (props: LogsContextPropsType) => {
    const [logs, reducer] = useReducer(LogsReducer, initialState);

    const fetchAll = useCallback(async () => {
        try {
            reducer({
                type: 'START_FETCH'
            });
            const data = await getAllLogs();
            reducer({
                type: 'SET_ALL',
                payload: data
            });
        } catch (e) {
            defaultErrorMessage(e);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const context: LogsContextType = {
        state: logs,
        onFetchAll: () => {
        },
        onFetchOne: () => {
        }
    }

    return (
        <LogsContext.Provider value={context}>
            {props.children}
        </LogsContext.Provider>
    );
}

export default LogsContextProvider;