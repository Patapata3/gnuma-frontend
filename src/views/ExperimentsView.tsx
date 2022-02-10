import React, {useContext, useEffect, useState} from 'react';

import {Link} from 'react-router-dom';
import {Alert, Button, Card, Form, InputNumber, List, message, Modal, Popconfirm, Select, Spin, Table, Tag} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';

import {Experiment, ExperimentClassifier, ExperimentClassifierDTO} from "../state/experiments/reducer";
import HyperParameterForm from "../components/HyperParameterForm/HyperParameterForm";

import {ExperimentsContext} from "../components/ExperimentsContextProvider/ExperimentsContexProvider";
import {ClassifiersContext} from "../components/ClassifiersContextProvider/ClassifiersContextProvider";
import {Classifier, HyperParameter} from "../state/classifiers/reducer";
import {DatasetsContext} from "../components/DatasetsContextProvider/DatasetsContextProvider";
import TextArea from "antd/es/input/TextArea";
import {Dataset} from "../state/datasets/reducer";

export default function ExperimentsView() {
    const defaultDataConfig = {
        datasetId: '',
        name: '',
        validationSplit: 0,
        testSplit: 0,
        seed: 0
    }

    const experimentContext = useContext(ExperimentsContext);
    const classifierContext = useContext(ClassifiersContext);
    const datasetContext = useContext(DatasetsContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedClassifiers, setSelectedClassifiers] = useState([] as Array<string>);
    const [hyperParamValues, setHyperParamValues] = useState(new Map<string, Map<string, string | boolean>>());
    const [hyperParamsValid, setHyperParamsValid] = useState(false);
    const [dataConfig, setDataConfig] = useState(defaultDataConfig);
    const [description, setDescription] = useState('');


    useEffect(() => {
        experimentContext.onFetchAll()
    }, []);

    const handleCancel = () => {
        setModalVisible(false);
    }

    const onStartButtonClick = () => {
        classifierContext.onFetchAll();
        datasetContext.onFetchAll();
        setModalVisible(true);
    }

    const colorMap = new Map<string, string>([
        ["FINISH", "#87d068"],
        ["PAUSE", "#2db7f5"],
        ["TRAIN", "#108ee9"],
        ["EVAL", "#108ee9"],
        ["STOP", "#C70039"],
        ["ERROR", "#C70039"]
    ])

    const DEFAULT_COLOR = "#108ee9"

    const renderExperimentActions = (experiment: Experiment) => {
        return (
            <>
                <Link to={`/experiments/${experiment.id}`}>
                    <Button
                        type={'text'}
                        icon={<SearchOutlined/>}
                    />
                </Link>
                <Popconfirm
                    title={"Delete experiment?"}
                    onConfirm={() => experimentContext.onDelete(experiment.id)}
                >
                    <Button
                        type={'text'}
                        danger
                        icon={<DeleteOutlined/>}
                    />
                </Popconfirm>
            </>
        )
    }

    const experiments = Object.values(experimentContext.state.elements);
    const classifiers = Object.values(classifierContext.state.elements);
    const classifierMap = new Map(classifiers.map(classifier => [`${classifier.id} at ${classifier.address}`, classifier] as [string, Classifier]));
    const datasets = Object.values(datasetContext.state.elements);
    const datasetMap = new Map(datasets.map(dataset => [`${dataset.id}`, dataset] as [string, Dataset]));

    const chooseTagColor = (status: string) => {
        return colorMap.has(status) ? colorMap.get(status) : DEFAULT_COLOR;
    }

    const renderClassifierList = (record: Experiment) => {
        return (
            <>
                <List
                    size="small"
                    dataSource={record.classifiers ? record.classifiers : [] as ExperimentClassifier[]}
                    renderItem={item => (
                        <List.Item>
                            <Tag color={chooseTagColor(item.status)}>
                                {item.status}
                            </Tag>{`${item.remoteId} at ${item.address}`}
                        </List.Item>
                    )}
                >
                </List>
            </>
        )

    }

    const handleSelectChange = (selectedClassifiers: string[]) => {
        setSelectedClassifiers(selectedClassifiers);
    }

    const handleDatasetChange = (selectedDataset: string) => {
        const selectedDatasetObject = datasetMap.get(selectedDataset) as Dataset
        setDataConfig(prevState => ({...prevState, datasetId: selectedDataset, name: selectedDatasetObject.name}));
    }

    const handleSelect = (selectedClassifier: string) => {
        const classifier = classifierMap.get(selectedClassifier)
        if (!classifier) {
            return;
        }
        setHyperParamValues(hyperParamValues.set(classifier.address, createHyperParamsMap(classifier)))
    }

    const createHyperParamsMap = (classifier: Classifier) => {
        return new Map(classifier.hyperParameters.map(param => [param.key, param.defaultValue ? param.defaultValue : getDefaultValue(param)] as [string, string | boolean]))
    }

    const getDefaultValue = (param: HyperParameter) => {
        return param.type === 'BOOLEAN' ? false : '';
    }

    const handleHyperParamChange = (address: string, values: Map<string, string | boolean>, isValid: boolean) => {
        setHyperParamValues(new Map(hyperParamValues).set(address, values));
        setHyperParamsValid(isValid);
    }

    const onStartExperiment = () => {
        setModalLoading(true);
        const startedClassifiers: ExperimentClassifierDTO[] = selectedClassifiers.map(classifierKey => {
            const classifier = classifierMap.get(classifierKey) as Classifier;
            return ({
                id: classifier.id,
                address: classifier.address,
                hyperParameterValues: Array.from(hyperParamValues.get(classifier.address) as Map<string, string | boolean>)
                    .reduce((obj, [key, value]) => {
                        obj[key] = value;
                        return obj;
                    }, {} as {
                        [key: string]: string | boolean
                    })
            });
        })
        const experimentDTO = {
            description: description,
            classifiers: startedClassifiers,
            data: dataConfig
        }
        experimentContext.onStart(experimentDTO);
        setModalVisible(false);
        setModalLoading(false);
        setSelectedClassifiers([]);
        setDataConfig(defaultDataConfig);
    }

    return (
        <div key={'experiments-view'}>
            <Card
                title={'Experiments'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={onStartButtonClick}
                    >
                        Start
                    </Button>
                }
            >
                <Modal title="Start an experiment"
                       visible={modalVisible}
                       onCancel={handleCancel}
                       centered
                       width='50%'
                       footer={[
                           <Button key="back" onClick={handleCancel}>
                               Cancel
                           </Button>,
                           <Button key="start" disabled={!hyperParamsValid || selectedClassifiers.length === 0} type={'primary'} loading={modalLoading} onClick={onStartExperiment}>
                               Start
                           </Button>
                       ]}
                >
                    <Spin spinning={classifierContext.state.loading}>
                        <Form
                            labelCol={{span: 6}}
                            wrapperCol={{span: 16}}
                            layout="horizontal"
                        >
                            <Form.Item label="Dataset">
                                <Select placeholder={'Pick a dataset'}
                                        value={dataConfig.datasetId}
                                        onChange={handleDatasetChange}
                                >
                                    {datasets.map(dataset => (
                                        <Select.Option key={dataset.id} value={dataset.id}>{dataset.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label={'Validation split'}>
                                <InputNumber value={dataConfig.validationSplit}
                                             onChange={(newValue) => setDataConfig(prevState => ({...prevState, validationSplit: newValue}))}/>
                            </Form.Item>
                            <Form.Item label={'Test split'}>
                                <InputNumber value={dataConfig.testSplit}
                                             onChange={(newValue) => setDataConfig(prevState => ({...prevState, testSplit: newValue}))}/>
                            </Form.Item>
                            <Form.Item label={'Seed'}>
                                <InputNumber value={dataConfig.seed}
                                             onChange={(newValue) => setDataConfig(prevState => ({...prevState, seed: newValue}))}/>
                            </Form.Item>
                            <Form.Item label={'Description'}>
                                <TextArea rows={4} value={description} onChange={event => setDescription(event.target.value)}/>
                            </Form.Item>
                            <Form.Item label="Classifiers">
                                <Select mode={'multiple'}
                                        placeholder={'Pick a classifier'}
                                        value={selectedClassifiers}
                                        style={{width: '100%'}}
                                        onChange={handleSelectChange}
                                        onSelect={handleSelect}
                                >
                                    {classifiers.map(classifier => (
                                        <Select.Option key={classifier.address} value={`${classifier.id} at ${classifier.address}`}>{classifier.id}</Select.Option>
                                    ))
                                    }
                                </Select>
                            </Form.Item>
                        </Form>
                        <div hidden={selectedClassifiers.length === 0} style={{height: "200px", overflowY: "scroll", scrollBehavior: "smooth"}}>
                        {selectedClassifiers.map(classifierKey => (
                            <HyperParameterForm onFieldChange={handleHyperParamChange} values={hyperParamValues} classifier={classifierMap.get(classifierKey) as Classifier}/>
                        ))}
                        </div>
                    </Spin>
                </Modal>
                <Table
                    loading={experimentContext.state.loading}
                    dataSource={experiments}
                    columns={[
                        {
                            title: 'Date',
                            dataIndex: 'date',
                            render: (_, record) => <Link to={`/experiments/${record.id}`}>{new Date(record.date).toLocaleString()}</Link>
                        },
                        {
                            title: 'Description',
                            dataIndex: 'description',
                            render: (_, record) => record.description
                        },
                        {
                            title: 'Dataset',
                            dataIndex: 'dataset',
                            render: (_, record) => record.data.name
                        },
                        {
                            title: 'Validation split',
                            dataIndex: 'validationSplit',
                            render: (_, record) => record.data.validationSplit
                        },
                        {
                            title: 'Test split',
                            dataIndex: 'testSplit',
                            render: (_, record) => record.data.testSplit
                        },
                        {
                            title: 'Seed',
                            dataIndex: 'seed',
                            render: (_, record) => record.data.seed
                        },
                        {
                            title: 'Classifiers',
                            dataIndex: 'classifiers',
                            render: (_, record) => renderClassifierList(record)
                        },
                        {
                            title: '',
                            dataIndex: '',
                            align: 'right',
                            render: (_, record) => renderExperimentActions(record)
                        }
                    ]}
                >
                </Table>
            </Card>
        </div>
    )
}
