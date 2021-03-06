import React from 'react';
import { format } from 'date-fns';
import { Table } from 'antd';

import styles from './DataTable.module.scss';
import { useSelector } from 'react-redux';
import { Store } from '../../../../store';
import { Payment } from '../../../../store/History/history.reducer';

const columns = [
  {
    title: 'Дата',
    key: 'date',
    render: (completed: boolean, record: Payment) => {
      return <span key={record.date}>{format(new Date(record.date).getTime(), 'MM.dd.yyyy HH:mm')}</span>;
    },
  },
  {
    title: 'Операция',
    key: 'operations',
    render: (completed: boolean, record: Payment) => {
      return <span key={record._id}>{record.purposeTitle.ru}</span>;
    },
  },
  {
    title: 'Сумма',
    key: 'sum',
    render: (completed: boolean, record: Payment) => {
      return <span key={record.sum}>{record.sum / 100}</span>;
    },
  },
  {
    title: 'Описание',
    key: 'description',
    render: (completed: boolean, record: any) => {
      return `${record.vrp}, с ${format(new Date(record.reservationStart).getTime(), 'HH:mm')} до ${format(
        new Date(record.reservationEnd).getTime(),
        'HH:mm',
      )}`;
    },
  },
];

const DataTable = () => {
  const { items } = useSelector((state: Store) => state.history.data);

  return (
    <div className={styles.DataTable}>
      <Table
        pagination={{
          pageSize: 5,
        }}
        columns={columns}
        dataSource={items}
      />
    </div>
  );
};

export default DataTable;
