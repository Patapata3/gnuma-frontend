import React, {useContext} from 'react';

import {Button, Card} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import DocumentsList from '../components/DocumentList/DocumentsList';
import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';


export default function DocumentsView() {
    const context = useContext(DocumentsContext);

    return (
        <div key={'documents-view'}>
            <Card
                title={'All Documents'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            const createWord = (size: number = 10) => {
                                const chars = "abcdefghicjklmnopqrstuvwxyz";
                                return [...Array(Math.floor(Math.random() * size))]
                                    .map(() => {
                                        return chars[Math.floor(Math.random() * chars.length)];
                                    })
                                    .join('');
                            }

                            const createSentence = (size: number = 50) => {
                                return [...Array(Math.floor(Math.random() * size))]
                                    .map(createWord)
                                    .join(' ');
                            }
                            context.onCreate({
                                source: createWord(10),
                                domain: createWord(10),
                                sentences: [],
                                augmented: false,
                                citationInformation: '',
                                contributor: '',
                                dataFields: [],
                                tasks: []
                            })
                        }}
                    >
                        New
                    </Button>
                }
            >
                <DocumentsList showActions={true}/>
            </Card>
        </div>
    );
}