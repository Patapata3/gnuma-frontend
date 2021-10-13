import {message} from 'antd';
import {RequestError} from '../service/exceptions';


export const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DatasetContextProvider?');
    }
}

export const defaultErrorMessage = (e: any, messageKey?: string) => {
    console.error(e);
    message.error({content: e.message, key: messageKey});
    if (!(e instanceof (RequestError || TypeError))) {
        throw e;
    }
}