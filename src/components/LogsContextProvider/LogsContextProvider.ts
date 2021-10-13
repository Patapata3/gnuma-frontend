import {createContext} from 'react';
import {missingProviderError} from '../../util/presentation';

type LogsContextType = {

}

export const LogsContext = createContext<LogsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne')
});

const LogsContextProvider = () => {

}

export default LogsContextProvider;