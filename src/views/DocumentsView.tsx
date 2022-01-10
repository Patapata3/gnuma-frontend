import React from 'react';

import {Button, Card, Checkbox, Divider, Form, Input, message, Modal, Select, Steps, Table, Tooltip} from 'antd';
import {PlusOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';

import DocumentsList from '../components/DocumentList/DocumentsList';
import FileDropTarget from '../components/FileDropTaret/FileDropTarget';

import {FieldData} from 'rc-field-form/lib/interface';


export type FieldInfo = {
    [key: string]: {
        name: string;
        description: string;
    };
};

export type MetaData = {
    domain: string;
    source: string;
    contributor: string;
    citationInformation: string;
    tasks: string[];
    augmented: boolean;
    rootDocument?: string;
    [key: string]: any;
}

export default function DocumentsView() {
    const context = React.useContext(DocumentsContext);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);
    const [fieldInfo, setFieldInfo] = React.useState<FieldInfo>({});
    const [currentStep, setCurrentStep] = React.useState(0);
    const [metaData, setMetaData] = React.useState<MetaData>({
        domain: '',
        source: '',
        contributor: '',
        citationInformation: '',
        tasks: [],
        augmented: false
    })

    const cancelUpload = async () => {
        setModalVisible(false);
        setFiles([]);
        setCurrentStep(0);
    }

    const executeUpload = async () => {
        //setModalVisible(false);

        const uploadPromises = files.map(async (f) => {
            return context.onCreate({
                ...metaData,
                dataFields: Object.keys(fieldInfo).map(k => fieldInfo[k]),
                data: f
            });
        });

        //setFiles([]);

        await Promise.all(uploadPromises);
    }

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    }

    const onFieldsChanged = (changedFields: FieldData[], _: FieldData[]) => {
        let newMetaData = {...metaData};
        changedFields.forEach(field => {
            if (Array.isArray(field.name)) {
                field.name.forEach(n => {
                    newMetaData[n] = field.value;
                });
            } else {
                newMetaData[field.name] = field.value;
            }
        });
        setMetaData(newMetaData);
    }

    const renderButtons = () => {
        const buttons: React.ReactNode[] = [];
        if (currentStep > 0) {
            buttons.push((<Button onClick={prevStep}>Previous</Button>));
        }
        if (currentStep < steps.length - 1) {
            buttons.push((<Button onClick={nextStep} type={'primary'}>Next</Button>));
        }
        if (currentStep === steps.length - 1) {
            buttons.push((<Button onClick={executeUpload} type={'primary'}>Upload</Button>));
        }
        return buttons;
    }

    const handleFilesDropped = async (droppedFiles: File[]) => {
        setFiles([...files, ...droppedFiles]);

        const newFieldInfo = {...fieldInfo};
        const fieldsAnalyzedPromises = droppedFiles.map(async (f) => {
            const text = await f.text();
            const lines = text.split(/\r?\n/);
            let headerLine = null;
            for (const line of lines) {
                if (line.match(/\s*#.*/)) {
                    // comment line, ignore
                    continue;
                }
                headerLine = line;
                break;
            }

            if (headerLine == null) {
                message.error(`File ${f} is empty, or consists only of comments, ignoring it.`);
                return;
            }

            const fields = headerLine.trim().split('\t');
            for (const field of fields) {
                if (!(field in newFieldInfo)) {
                    newFieldInfo[field] = {
                        name: field,
                        description: ''
                    }
                }
            }
        });
        await Promise.all(fieldsAnalyzedPromises);

        setFieldInfo(newFieldInfo);
    }

    const steps: {
        title: string;
        content: React.ReactNode;
    }[] = [
        {
            title: 'Document information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item
                        label={'Contributor (your name)'}
                        name={'contributor'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Source'}
                        name={'source'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Domain'}
                        name={'domain'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Citation information'}
                        name={'citationInformation'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Supported tasks'}
                        name={'tasks'}
                    >
                        <Select
                            mode={'multiple'}
                        >
                            {
                                [
                                    'NAMED_ENTITY_RECOGNITION',
                                    'RELATION_PREDICTION',
                                    'SEMANTIC_ROLE_LABELING'
                                ].map(tag => <Select.Option value={tag}>{tag}</Select.Option>)
                            }
                        </Select>
                    </Form.Item>
                </Form>
            )
        },
        {
            title: 'Augmentation information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item
                        label={'Documents are augmented'}
                        name={'augmented'}
                        valuePropName={'checked'}
                    >
                        <Checkbox/>
                    </Form.Item>

                    <Form.Item
                        label={'Augmented document naming rule'}
                        name={'augmentedDocumentNameRule'}
                    >
                        <Input
                            addonAfter={
                                <Tooltip
                                    title={'Name '}
                                ><QuestionCircleOutlined/>
                                </Tooltip>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label={'Root document naming rule'}
                        name={'rootDocumentNameRule'}
                    >
                        <Input
                            addonAfter={
                                <Tooltip
                                    title={'Name '}
                                ><QuestionCircleOutlined/>
                                </Tooltip>
                            }
                        />
                    </Form.Item>
                </Form>
            )
        },
        {
            title: 'Upload CoNLL documents',
            content: (
                <>
                    <FileDropTarget
                        onFilesDropped={handleFilesDropped}
                    />
                    <Divider type={'horizontal'}/>
                    <Table
                        dataSource={files}
                        columns={[
                            {title: 'File', dataIndex: 'name'}
                        ]}
                        pagination={{
                            pageSize: 5
                        }}
                    />
                </>
            )
        },
        {
            title: 'Field information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item>
                        <Table
                            dataSource={Object.keys(fieldInfo).map(k => {
                                return {
                                    key: k,
                                    name: fieldInfo[k].name,
                                    description: fieldInfo[k].description
                                };
                            })}
                            columns={[
                                {title: 'Id', dataIndex: 'key'},
                                {
                                    title: 'Name',
                                    dataIndex: 'name',
                                    render: (value, record) => {
                                        return (<Input value={value} onChange={(event) => {
                                            const newFieldInfo = {...fieldInfo};
                                            newFieldInfo[record.key] = {
                                                name: event.target.value,
                                                description: record.description
                                            }
                                            setFieldInfo(newFieldInfo);
                                        }}/>);
                                    }
                                },
                                {
                                    title: 'Description',
                                    dataIndex: 'description',
                                    render: (value, record) => {
                                        return (<Input value={value} onChange={(event) => {
                                            const newFieldInfo = {...fieldInfo};
                                            newFieldInfo[record.key] = {
                                                name: record.name,
                                                description: event.target.value
                                            }
                                            setFieldInfo(newFieldInfo);
                                        }}/>);
                                    }
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            )
        }
    ]

    return (
        <div key={'documents-view'}>
            <Card
                title={'All Documents'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={() => setModalVisible(true)}
                    >
                        New
                    </Button>
                }
            >
                <Modal
                    title={'Upload files'}
                    width={750}
                    visible={modalVisible}
                    onCancel={cancelUpload}
                    footer={renderButtons()}
                >
                    <Steps current={currentStep}>
                        {
                            steps.map(() => <Steps.Step/>)
                        }
                    </Steps>
                    <Divider type={'horizontal'}/>
                    <div>
                        <h3>{steps[currentStep].title}</h3>
                        <Divider type={'horizontal'}/>
                        <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                            {steps[currentStep].content}
                        </div>
                    </div>
                </Modal>
                <DocumentsList showActions={true}/>
            </Card>
        </div>
    );
}