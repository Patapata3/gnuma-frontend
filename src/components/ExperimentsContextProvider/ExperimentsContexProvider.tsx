import React, {createContext, Dispatch, useReducer} from 'react';

import {message} from 'antd';

import {
    startExperiment,
    getAllExperiments,
    getSingleExperiment,
    stopExperiment,
    pauseExperiment,
    resumeExperiment,
    deleteExperiment
} from "../../service/experimentService";

import {
    buildGenericCreate,
    buildGenericDeleteSingle,
    buildGenericFetchAll,
    buildGenericFetchOne,
    defaultErrorMessage
} from '../../util/presentation';

import {GenericPayloadState} from '../../state/common/reducer';

import ExperimentsReducer, {Experiment, initialState} from "../../state/experiments/reducer";
import {GenericPayloadActions} from "../../state/common/actions";

type ExperimentContextType = {
    state: GenericPayloadState<Experiment>;
    onFetchAll: () => void;
    onFetchOne: (id: string) => void;
    onStart: (experiment: Partial<Experiment>) => void;
    onDelete: (id: string) => void;
    onStop: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into an ExperimentsContextProvider?');
    }
}

const asyncMissingProviderError = (name: string) => {
    return async () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into an ExperimentsContextProvider?');
    }
}

export const ExperimentsContext = createContext<ExperimentContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onStart: missingProviderError('onStart'),
    onDelete: missingProviderError('onDelete'),
    onPause: missingProviderError('onPause'),
    onResume: missingProviderError('onResume'),
    onStop: missingProviderError('onStop')
});

type ExperimentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const ExperimentsContextProvider = (props: ExperimentContextProviderProps) => {
    const[experiments, dispatch] = useReducer(ExperimentsReducer, initialState);

    const fetchOne = buildGenericFetchOne(dispatch, getSingleExperiment);
    const fetchAll = buildGenericFetchAll(dispatch, getAllExperiments);
    const start = buildGenericCreate(dispatch, startExperiment);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteExperiment);
    const pause = buildExperimentOperation(dispatch, pauseExperiment, "pause");
    const resume = buildExperimentOperation(dispatch, resumeExperiment, "resume");
    const stop = buildExperimentOperation(dispatch, stopExperiment, 'stop');

    const context: ExperimentContextType = {
        state: experiments,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onStart: start,
        onDelete: deleteSingle,
        onPause: pause,
        onResume: resume,
        onStop: stop
    }

    return (
        <ExperimentsContext.Provider value={context}>
            {props.children}
        </ExperimentsContext.Provider>
    )

}

function buildExperimentOperation(dispatch: Dispatch<GenericPayloadActions<Experiment>>, operation: (id: string) => Promise<Experiment>, operationKey: string) {
    const conversionMap = new Map<string, OperationConversion>([
        ["pause", {continuous: "Pausing", participle: "paused"}],
        ["resume", {continuous: "Resuming", participle: "resumed"}],
        ["stop", {continuous: "Stopping", participle: "stopped"}]
    ])
    return async (id: string) => {
        const messageKey = `${operationKey}-${id}`;
        try {
            const conversion = conversionMap.get(operationKey)
            const content = conversion ? conversion.continuous : "Updating";
            message.loading({content: `${content}...`, key: messageKey});
            const updatedExperiment = await operation(id);
            message.success({
                content: `Experiment successfully ${conversion ? conversion.participle : 'updated'}`,
                key: messageKey
            });
            dispatch({
                type: 'SET_ONE',
                payload: updatedExperiment
            });
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }
}

type OperationConversion = {
    continuous: string;
    participle: string;
}

export default ExperimentsContextProvider;
