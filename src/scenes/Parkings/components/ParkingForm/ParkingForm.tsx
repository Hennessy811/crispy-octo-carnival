import React, { FC, useEffect, useCallback } from 'react';
import { throttle } from 'lodash';
import styles from './ParkingForm.module.scss';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import { Checkbox, Input, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import ContentCard from '../../../../shared/components/ContentCard';
import Button from '../../../../shared/components/AntOverrides/Button';
import { useFormik } from 'formik';
import { Store } from '../../../../store';
import FormRowItem from '../../../../shared/components/FormRowItem';
import { ParkingsActions } from '../../../../store/Parkings/parkings.actions';
import {
  initialValues,
  getValidationSchema,
  vehicleTypes,
  durations,
  icons,
} from '../../../../shared/utils/ParkingForm/helpers';
import { VrpRegexpsLocal } from '../../../../store/Config/config.reducer';

const { Option } = Select;

const iconOptions = {
  fill: styles.green,
  heigth: 31,
  width: 31,
};

interface ParkingForm {
  zones: any[];
}

const ParkingForm: FC<ParkingForm> = ({ zones }) => {
  const { isLoading } = useSelector((state: Store) => state.parkings);
  const cost = useSelector((state: Store) => state.parkings.data.cost);
  const config = useSelector((state: Store) => state.config.data);
  const dispatch = useDispatch();

  const handlerSubmit = (values: any) => {
    const payload = {
      ...values,
      start: new Date(),
    };

    dispatch({
      type: ParkingsActions.CreateParking,
      payload,
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: () =>
      config &&
      getValidationSchema({
        vrpIsLocal: formik.values.vrpFormat === 'local',
        vehicleType: formik.values.vehicleType as keyof VrpRegexpsLocal,
        config,
      }),
    onSubmit: handlerSubmit,
  });

  const handlerCheckCost = useCallback(
    throttle(() => {
      const payload = {
        ...formik.values,
        start: new Date(),
      };

      delete payload.vrpFormat;

      dispatch({
        type: ParkingsActions.CheckCostParking,
        payload,
      });
    }, 1000),
    [formik.values],
  );

  useEffect(() => {
    if (Object.keys(formik.touched).length && formik.isValid) {
      handlerCheckCost();
    }
  }, [formik.touched, formik.isValid, handlerCheckCost]);

  const selectBeforeType = (
    <Select
      style={{ width: 70 }}
      defaultValue={formik.values.vehicleType}
      onChange={(value: string) => formik.setFieldValue('vehicleType', value)}
      onBlur={formik.handleBlur}
      className={styles.Select}
    >
      {vehicleTypes.map(value => {
        const Icon = icons[value];
        return (
          <Option key={value} value={value}>
            <Icon {...iconOptions} />
          </Option>
        );
      })}
    </Select>
  );

  const selectSource = (
    <Select
      style={{ width: 250 }}
      defaultValue={formik.values.zoneNumber}
      onChange={(value: string) => formik.setFieldValue('zoneNumber', value)}
      onBlur={formik.handleBlur}
    >
      {zones &&
        zones.map(option => (
          <Option key={option.number} value={option.number}>
            {option.number}
          </Option>
        ))}
    </Select>
  );

  const selectDuration = (
    <Select
      style={{ width: 250 }}
      defaultValue={formik.values.duration}
      onChange={(value: string) => formik.setFieldValue('duration', value)}
      onBlur={formik.handleBlur}
    >
      {durations.map(duration => (
        <Option key={duration.value} value={duration.value}>
          {duration.label}
        </Option>
      ))}
    </Select>
  );

  return (
    <ContentCard>
      <Title level={3}>Оплатить уличную парковку</Title>
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.FormRow}>
          <FormRowItem label="Номер машины" error={formik.errors.vrp}>
            <Input
              name="vrp"
              addonBefore={selectBeforeType}
              defaultValue={formik.values.vrp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormRowItem>

          <FormRowItem label="Зона" error={formik.errors.zoneNumber}>
            {selectSource}
          </FormRowItem>

          <FormRowItem label="Время на парковке" error={formik.errors.duration}>
            {selectDuration}
          </FormRowItem>
        </div>

        <div className={styles.ConfirmRow}>
          <div>
            <Checkbox
              name="vrpFormat"
              checked={formik.values.vrpFormat === 'foreign'}
              onChange={e => formik.setFieldValue('vrpFormat', e.target.checked ? 'foreign' : 'local')}
            >
              Прочий (иностранный) номер ТС
            </Checkbox>
            <br />
            <Text>Стоимость зависит от выбранной парковочной зоны</Text>
          </div>

          <div className={styles.ButtonBlock}>
            <Text className={styles.Sum}>{cost ? `${cost.sum} ₽` : ''}</Text>
            <Button className={styles.ConfirmButton} type={isLoading ? 'dashed' : 'primary'} htmlType="submit">
              Создать
            </Button>
          </div>
        </div>
      </form>
      <br />
    </ContentCard>
  );
};

export default ParkingForm;
