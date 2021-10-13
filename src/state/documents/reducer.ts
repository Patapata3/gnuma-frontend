import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';


export type Document = {
    domain: string;
    source: string;
    text: string;
    id: string;
    uri: string;
}

export const initialState: GenericPayloadState<Document> = {
    elements: {},
    loading: false
}

type DocumentReducerType = Reducer<GenericPayloadState<Document>, GenericPayloadActions<Document>>;

const DocumentsReducer: DocumentReducerType = genericPayloadReducer;

export default DocumentsReducer;