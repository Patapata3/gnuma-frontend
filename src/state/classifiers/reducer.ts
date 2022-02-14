import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type HyperParameter = {
    id: string,
    key: string,
    type: string,
    optional: boolean,
    defaultValue: string,
    valueList: string[],
    lowerBound: number,
    upperBound: number
}

export type Classifier = {
    id: string,
    address: string,
    hyperParameters: HyperParameter[]
}

export const initialState: GenericPayloadState<Classifier> = {
    elements: {},
    loading: false
}

type ClassifierReducerType = Reducer<GenericPayloadState<Classifier>, GenericPayloadActions<Classifier>>;

const ClassifierReducer: ClassifierReducerType = genericPayloadReducer;

export default ClassifierReducer;
