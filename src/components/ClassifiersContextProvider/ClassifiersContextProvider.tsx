import React, {createContext, Dispatch, useReducer} from 'react';

import {
    buildGenericFetchAll,
} from "../../util/presentation";

import {GenericPayloadState} from '../../state/common/reducer';

import ClassifierReducer, {Classifier, initialState} from "../../state/classifiers/reducer";
import {getAllClassifiers} from "../../service/classifierService";

type ClassifierContextType = {
    state: GenericPayloadState<Classifier>;
    onFetchAll: () => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a ClassifierContextProvider?');
    }
}

const asyncMissingProviderError = (name: string) => {
    return async () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a ClassifierContextProvider?');
    }
}

export const ClassifiersContext = createContext<ClassifierContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll')
})

type ClassifierContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const ClassifierContextProvider = (props: ClassifierContextProviderProps) => {
    const[classifiers, dispatch] =useReducer(ClassifierReducer, initialState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllClassifiers);

    const context: ClassifierContextType = {
        state: classifiers,
        onFetchAll: fetchAll
    }

    return (
        <ClassifiersContext.Provider value={context}>
            {props.children}
        </ClassifiersContext.Provider>
    )
}

export default ClassifierContextProvider;





