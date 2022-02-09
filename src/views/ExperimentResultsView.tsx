import React, {useContext, useEffect, useState} from 'react';

import {useHistory, useParams} from 'react-router-dom';
import {ExperimentsContext} from "../components/ExperimentsContextProvider/ExperimentsContexProvider";
import {Button, Card, Col, Collapse, PageHeader, Progress, Row, Skeleton, Spin, Tag} from "antd";
import {Experiment, ExperimentClassifier} from "../state/experiments/reducer";
import {getStatusColor} from "../service/experimentService";
import {PauseCircleOutlined, PauseOutlined, PlayCircleOutlined, StopOutlined} from "@ant-design/icons";
import CollapsePanel from "antd/es/collapse/CollapsePanel";
import {
    Crosshair, DiscreteColorLegend,
    HorizontalGridLines,
    LineSeries, LineSeriesPoint,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis
} from "react-vis";

export default function ExperimentResultsView() {
    const experimentContext = useContext(ExperimentsContext);
    const [loading, setLoading] = useState(true);
    const [crosshairValues, setCrossHairValues] = useState({} as {[key: string]: {x: number, y: number}[]});

    const {id} = useParams<{ id: string }>();
    const history = useHistory();

    useEffect(() => {
        console.log('UseEffect')
        experimentContext.onFetchOne(id);
        setLoading(false);
    },[id]);

    const experiment = experimentContext.state.elements[id];

    const renderTitle = () => {
        if (!experiment) {
            return (<Skeleton active title={{width: 200}} paragraph={false}/>);
        }
        return `Experiment from ${new Date(experiment.date).toLocaleString()}`;
    }

    const renderProgressTab = () => {
        if (!experiment) {
            return (<Spin/>)
        }
        const classifierRows = divideObjectsForGrid<ExperimentClassifier>(experiment.classifiers, 4);

        return (
            classifierRows.map(classifierRow => (
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    {classifierRow.map(classifier => (
                        <Col span={6}>
                            {renderProgress(classifier)}
                        </Col>
                    ))}
                </Row>
            ))
        )
    }

    const divideObjectsForGrid = <T, >(classifiers: T[], rowLength: number): T[][] => {
        const objectRows: T[][] = [];
        let i: number;
        let objectsRow: T[] = [];
        for (i = 0; i < classifiers.length; i++) {
            objectsRow.push(classifiers[i]);
            if (i % rowLength === 2) {
                objectRows.push(objectsRow);
                objectsRow = [];
            }
        }
        if (objectsRow.length != 0) {
            objectRows.push(objectsRow);
        }
        return objectRows;
    }

    const renderProgressCircle = (percent: number, classifier: ExperimentClassifier) => {
        switch (classifier.status) {
            case 'TRAIN':
                return `Training ${percent}%`
            case 'TEST':
                return 'Testing'
            case 'FINISH':
                return 'Done'
            default:
                return classifier.status
        }
    }

    const getProgressStatus = (classifier: ExperimentClassifier) => {
        if (classifier.status === 'FINISHED') {
            return "success";
        }
        if (classifier.status === 'ERROR' || classifier.status === 'STOP') {
            return "exception";
        }
        return "normal";
    }

    const renderProgress = (classifier: ExperimentClassifier) => {
        return (
            <Card title={classifier.remoteId}
                  extra={
                      <Tag color={getStatusColor(classifier.status)}>
                          {classifier.status}
                      </Tag>
                  }
                  loading={loading}
                  bodyStyle={{textAlign: "center"}}
            >
                <Progress type="circle" percent={classifier.currentStep && classifier.totalSteps ? classifier.currentStep / classifier.totalSteps * 100 : 0}
                          format={percent => renderProgressCircle(percent as number, classifier)}
                          status={getProgressStatus(classifier)}/>
                <div>
                    <Button type="primary"
                            icon={<PauseCircleOutlined/>}
                            disabled={classifier.status !== 'TRAIN'}
                            onClick={() => experimentContext.onPause(id, [classifier])}/>
                    <Button type="primary"
                            style={classifier.status === 'PAUSE' ? {backgroundColor: "green", borderColor: "green", margin: "5px"} : {margin: "5px"}}
                            icon={<PlayCircleOutlined/>}
                            disabled={classifier.status !== 'PAUSE'}
                            onClick={() => experimentContext.onResume(id, [classifier])}/>
                    <Button type="primary"
                            danger
                            icon={<StopOutlined/>}
                            disabled={classifier.status !== 'TRAIN' && classifier.status !== 'PAUSE'}
                            onClick={() => experimentContext.onStop(id, [classifier])}/>
                </div>
            </Card>
        )
    }

    const renderResults = () => {
        if (!experiment) {
            return (<Spin/>)
        }
        const metrics = new Set(experiment.classifiers.flatMap(classifier => Object.keys(classifier.trainResults)));
        const metricRows: string[][] = divideObjectsForGrid(Array.from(metrics), 3);

        return (
            metricRows.map(metricRow => (
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    {metricRow.map(metric => (
                        <Col span={8}>
                            {renderMetric(metric)}
                        </Col>
                    ))}
                </Row>
            ))
        )
    }

    const renderMetric = (metric: string) => {
        const relevantClassifiers = experiment.classifiers.filter(classifier => classifier.trainResults[metric]);
        const maxLength = relevantClassifiers
            .reduce((previousValue, currentValue) =>
                previousValue.trainResults[metric].length > currentValue.trainResults[metric].length ? previousValue : currentValue)
            .trainResults[metric].length
        return (
            <Card title={metric} bodyStyle={{textAlign: "center"}}>
                <XYPlot width={300} height={300} onMouseLeave={() => setCrossHairValues((prevState => {
                    return {...prevState, [metric]: []}
                }))}
                >
                    <HorizontalGridLines/>
                    <VerticalGridLines/>
                    <XAxis title={'Step'} tickValues={Array.from(Array(maxLength + 1).keys())} tickFormat={value => value}
                    />
                    <YAxis title={metric}/>
                    {experiment.classifiers.filter(classifier => !!classifier.trainResults[metric]).map((classifier) => (
                        <LineSeries onNearestX={(datapoint) => fillCrossHair(metric, datapoint.x - 1)} data={formData(classifier.trainResults[metric])}/>
                    ))}
                    <Crosshair values={crosshairValues[metric]} titleFormat={formatTitle} itemsFormat={items => formatItems(metric, items)}/>
                    <DiscreteColorLegend items={experiment.classifiers.filter(classifier => !!classifier.trainResults[metric]).map(classifier => classifier.remoteId)}/>
                </XYPlot>
            </Card>
        )
    }

    const fillCrossHair = (metric: string, index: number) => {
        const crossHairValue = experiment.classifiers.filter(classifier => classifier.trainResults[metric])
            .map(classifier => formData(classifier.trainResults[metric])[index])
        setCrossHairValues(prevState => {
            return {...prevState, [metric]: crossHairValue}
        })
    }

    const formatItems = (metric: string, items: LineSeriesPoint[]) => {
        const relevantClassifiers = experiment.classifiers.filter(classifier => classifier.trainResults[metric])
        return items.map((item, i) => {
            return {title: relevantClassifiers[i].remoteId, value: item.y}
        })
    }

    const formatTitle = (items: any) => {
        return {title: 'Step', value: items[0].x}
    }

    const formData = (results: number[]) => {
        let i: number;
        const data = [];
        for (i = 0; i < results.length; i++) {
            data.push({x: i + 1, y: results[i]});
        }
        return data;
    }

    return (
        <div key={'experiment-results'}>
            <PageHeader
                onBack={() => history.push('/experiments')}
                title={renderTitle()}
            />
            <Collapse defaultActiveKey={['1', '2']} ghost>
                <CollapsePanel key={'1'} header={'Progress'}>
                    {renderProgressTab()}
                </CollapsePanel>
                <CollapsePanel key={'2'} header={'Results'}>
                    {renderResults()}
                </CollapsePanel>
            </Collapse>
        </div>
    )
}
