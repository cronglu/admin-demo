import React, { PureComponent } from 'react';
import { Table, Alert } from 'antd';
import { unique } from 'utils/utils';
import styles from './index.less';

function initSelectedRows(rowsRaw, keys, key) {
  const list = [];
  if (rowsRaw && keys && key) {
    const rows = unique(rowsRaw, key);
    keys.forEach(i => {
      const index = rows.findIndex(ii => i === ii[key]);
      if (index !== -1) {
        list.push(rows[index]);
      }
    });
  }

  return list;
}

class StandardTable extends PureComponent {
  static defaultProps = {
    rowKey: 'id',
    selectedRows: [],
    selectedRowKeys: null,
  };

  constructor(props) {
    super(props);
    const { selectedRows, selectedRowKeys, rowKey } = props;
    this.state = {
      selectedRows: initSelectedRows(selectedRows, selectedRowKeys, rowKey),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows, selectedRowKeys, rowKey } = nextProps;
    if (selectedRows && selectedRowKeys && selectedRowKeys.length !== this.props.selectedRowKeys) {
      this.setState({
        selectedRows: initSelectedRows(
          [...this.state.selectedRows, ...selectedRows],
          selectedRowKeys,
          rowKey
        ),
      });
    }
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const { rowKey, onSelectRow } = this.props;
    const rows = initSelectedRows(
      [...this.state.selectedRows, ...selectedRows],
      selectedRowKeys,
      rowKey
    );

    this.setState(
      {
        selectedRows: rows,
      },
      () => {
        if (onSelectRow) {
          onSelectRow(selectedRowKeys, rows);
        }
      }
    );
  };

  handleTableChange = ({ current, pageSize }) => {
    // , filters, sorter
    this.props.onChange({ current, pageSize });
  };

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const {
      data: { list, pagination },
      loading,
      rowKey,
      columns,
      selectedRowKeys,
      renderOperator,
    } = this.props;

    const paginationProps = pagination
      ? {
          showSizeChanger: true,
          showQuickJumper: true,
          ...pagination,
        }
      : pagination;

    const hasSelected = selectedRowKeys;

    const rowSelection = hasSelected
      ? {
          selectedRowKeys,
          onChange: this.handleRowSelectChange,
          getCheckboxProps: record => ({
            disabled: record.disabled,
          }),
        }
      : null;

    return (
      <div className={styles.standardTable}>
        {hasSelected && (
          <div className={styles.tableAlert}>
            <Alert
              message={
                <>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  {!!selectedRowKeys.length && (
                    <>
                      {renderOperator}
                      <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                        取消已选
                      </a>
                    </>
                  )}
                </>
              }
              type="info"
              showIcon
            />
          </div>
        )}
        <Table
          loading={loading}
          rowKey={rowKey}
          rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default StandardTable;
