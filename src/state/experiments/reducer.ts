import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Model = {
    id: string;
    remoteId: string;
    hyperParameterValues: {
        [key: string]: string
    }
}

export type ExperimentClassifier = {
    id: string;
    remoteId: string;
    address: string;
    model: Model;
}

export type Experiment = {
    id: string;
    date: string;
    status: string;
    classifier: ExperimentClassifier;
    trainDatasetId: string;
    testDatasetId: string;
    resultDatesetId: string;
    resultSourceType: string;
    results: {
        [key: string]: number[]
    }
}

export const initialState: GenericPayloadState<Experiment> = {
    elements: {},
    loading: false
}

type ExperimentReducerType = Reducer<GenericPayloadState<Experiment>, GenericPayloadActions<Experiment>>;

const ExperimentsReducer: ExperimentReducerType = genericPayloadReducer;

export default ExperimentsReducer;
