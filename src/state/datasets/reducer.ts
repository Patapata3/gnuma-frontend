import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Fold = {
    train: string[]
}

export type Data = {
    folds: Fold[]
}

export type Dataset = {
    name: string;
    description: string;
    id: string;
    data: Data;
}

export const initialState: GenericPayloadState<Dataset> = {
    elements: {},
    loading: false
}

type DatasetsReducerType = Reducer<GenericPayloadState<Dataset>, GenericPayloadActions<Dataset>>;

const DatasetsReducer: DatasetsReducerType = genericPayloadReducer;

export default DatasetsReducer;
