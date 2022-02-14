import React, {useState} from 'react';
import {Classifier, HyperParameter} from "../../state/classifiers/reducer";
import {Card, Checkbox, Form, Input, InputNumber, Select} from "antd";

export type HyperParameterFormProps = {
    onFieldChange: (address: string, hyperParameterValues: Map<string, string | boolean>, isValid: boolean) => void;
    values: Map<string, Map<string, string | boolean>>
    classifier: Classifier;
}

export default function HyperParameterForm (props: HyperParameterFormProps) {
    //const[values, setValues] = useState(new Map(props.classifier.hyperParameters.map(param => [param.key, param.defaultValue ? param.defaultValue : ''] as [string, string | boolean])))

    const values = props.values.get(props.classifier.address) as Map<string, string | boolean>;

    const handleChange = (key: string, newValue: string | boolean) => {
        //setValues(new Map(values).set(key, newValue));
        console.log(newValue)
        props.onFieldChange(props.classifier.address, values.set(key, newValue), checkAllValuesFilled());
    }

    const checkAllValuesFilled = () => {
        return !props.classifier.hyperParameters.filter(param => !param.optional && values.get(param.key) !== '0' && !values.get(param.key)).length
    }

    const renderSelect = (param: HyperParameter) => {
        const key = param.key;
        return (
            <Select
                value={values.get(key) as string}
                onChange={e => handleChange(key, e)}
                defaultValue={param.defaultValue}
                style={{ width: '100%' }}
            >
                {param.valueList.map(value => (
                    <Select.Option key={value} value={value}>{value}</Select.Option>
                ))}
            </Select>
        )
    }

    const renderTextInput = (param: HyperParameter) => {
        const key = param.key;
        return (
            <Input
                value={values.get(key) as string}
                onChange={(event) => handleChange(key, event.target.value)}
                style={{width: '100%'}}
                defaultValue={param.defaultValue}
            />
        )
    }

    const renderNumberInput = (param: HyperParameter) => {
        const key = param.key
        return (
            <InputNumber
                value={values.get(key) as string}
                onChange={(newValue: string) => handleChange(key, newValue)}
                style={{width: '100%'}}
                min={String(param.lowerBound === 0 || param.lowerBound ? param.lowerBound : Number.MIN_SAFE_INTEGER)}
                max={String(param.upperBound === 0 || param.upperBound ? param.upperBound : Number.MAX_SAFE_INTEGER)}
                precision={param.type === "INTEGER" ? 0 : undefined}
                defaultValue={param.defaultValue}/>
        )
    }

    const renderCheckBox = (param: HyperParameter) => {
        const key = param.key
        return (
            <Checkbox
                checked={values.get(key) === 'true' || values.get(key) as boolean}
                defaultChecked={!!(param.defaultValue) && param.defaultValue.toLowerCase() === "true"}
                onChange={e => handleChange(key, e.target.checked)}
            />
        )
    }

    const renderMap = new Map([
        ["STRING", renderTextInput],
        ["INTEGER", renderNumberInput],
        ["DOUBLE", renderNumberInput],
        ["BOOLEAN", renderCheckBox]
    ])

    const renderProperComponent = (param: HyperParameter) => {
        if (param.valueList && param.valueList.length > 0) {
            return renderSelect(param);
        }
        const renderFunction = renderMap.get(param.type);
        return renderFunction ? renderFunction(param) : renderTextInput(param)
    }

    return (
        <Card title={props.classifier.id}>
            <Form labelCol={{span: 6}}
                  wrapperCol={{span: 16}}
                  layout="horizontal">
                {props.classifier.hyperParameters.map(param => (
                    <Form.Item label={param.key}>
                        {renderProperComponent(param)}
                    </Form.Item>
                ))}
            </Form>
        </Card>
    )
}
