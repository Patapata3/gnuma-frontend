import {Document} from './reducer';
import {FailFetchAction, StartFetchAction} from '../common/actions';

export type DocumentsActions =
    StartFetchAction
    | FailFetchAction
    | SetAllDocumentsAction
    | SetOneDocumentAction
    | RemoveOneDocumentAction;

export interface SetAllDocumentsAction {
    type: 'SET_ALL';
    documents: Document[];
}

export interface SetOneDocumentAction {
    type: 'SET_ONE';
    document: Document;
}

export interface RemoveOneDocumentAction {
    type: 'REMOVE_ONE';
    documentId: string;
}
