import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';


export type Token = {
    token: string;
    nerTag: string;
    metaTags: {
        [key: string]: string
    }
}

export type Sentence = {
    id: number;
    tokens: Token[];
}

export type DataField = {

}

export type Document = {
    id: string;
    domain: string;
    source: string;
    contributor: string;
    citationInformation: string;
    dataFields: DataField[];
    tasks: string[];
    sentences: Sentence[];
    augmented: boolean;
    rootDocument?: string;
    uri: string;
}

export type UnPersistedDocument = {
    domain: string;
    source: string;
    contributor: string;
    citationInformation: string;
    dataFields: DataField[];
    tasks: string[];
    data: File;
    augmented: boolean;
    rootDocument?: string;
}

export const initialState: GenericPayloadState<Document> = {
    elements: {},
    loading: false
}

type DocumentReducerType = Reducer<GenericPayloadState<Document>, GenericPayloadActions<Document>>;

const DocumentsReducer: DocumentReducerType = genericPayloadReducer;

export default DocumentsReducer;