import React, { PureComponent, isValidElement } from 'react';
import { connect } from 'dva';
import { Table, Alert, Button } from 'antd';
import { Form, FormCore } from 'utils/noform';
import { Page } from 'components';
import { unique, filterObject } from 'utils/utils';
import { dateFormat, defaultPagination } from 'utils/config';
import Authorized from 'components/Authorized';
import { DragableBodyRow } from 'components/DragTable';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import _ from 'lodash'
import moment from 'moment';
import router from 'umi/router';
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

@connect(({ page, loading, routing }) => ({
  ...page,
  loading: loading.models.page,
  location: routing.location,
}))
class PageTable extends PureComponent {
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  static defaultProps = {
    rowKey: 'id',
    selectedRows: [],
    selectedRowKeys: [],
  };

  constructor(props) {
    super(props);
    const { selectedRows, selectedRowKeys, rowKey } = props;

    this.form = new FormCore();
    this.state = {
      selectedRows: initSelectedRows(selectedRows, selectedRowKeys, rowKey),
      selectedRowKeys,
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

  moveRow = (dragIndex, hoverIndex) => {
    const { list } = this.props;
    const dragRow = list[dragIndex];
    const newList = update(list, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    const dragIdList = [];
    newList.forEach(i => {
      dragIdList.push(i.id);
    });
    this.props.onDrag(dragIdList);
    // filters[dragSortSting] = dragIdList;

    // console.log('dragIdList', dragIdList, filters);
    // dispatch({
    //   type: 'page/read',
    //   payload: {
    //     defaultPagination,
    //     filters,
    //     noPage,
    //   },
    // });
    // this.setState(
    //   update(this.props, {
    //     list: {
    //       $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    //     },
    //   }),
    //   () => {}
    // );
  };

  onRowSelectChange = (selectedRowKeys, selectedRows) => {
    const { rowKey, onSelectRow } = this.props;

    const rows = initSelectedRows(
      [...this.state.selectedRows, ...selectedRows],
      selectedRowKeys,
      rowKey
    );

    this.setState(
      {
        selectedRows: rows,
        selectedRowKeys,
      },
      () => {
        if (onSelectRow) {
          onSelectRow(selectedRowKeys, rows);
        }
      }
    );
  };

  onChange = ({ current, pageSize }) => {
    const { state, query, ...restRoute } = this.props.location;
    const { rangeTime, ...rest } = this.form.getValues();
    const restFilter = { ...rest, ...this.props.filters };
    this.form.validate(() => {
      if (rangeTime && rangeTime.length > 0) {
        rest.start_time =
          rangeTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).valueOf() / 1000;
        rest.end_time =
          rangeTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).valueOf() / 1000;
      }
      if (rest.spread_course_id) {
        rest.course_id = null;
      }
      this.onRead(
        {
          current,
          pageSize,
        },
        filterObject(restFilter)
      );
    });

    // 增加路由信息，保证返回能维持状态
    router.replace({
      state: {
        ...state,
        filters: filterObject(restFilter),
        pagination: {
          current,
          pageSize,
        },
      },
      query,
      ...restRoute,
    });
  };

  onRead = (pagination = defaultPagination, filters = this.props.filters) => {
    this.props.dispatch({
      type: 'page/read',
      payload: {
        pagination,
        filters,
        noPage: this.props.noPage,
      },
    });
  };

  onSearch = type => {
    const { extraCallback } = this.props;
    const { state, query, ...restRoute } = this.props.location;
    if (type === 'reset') {
      this.form.reset();
      router.replace({
        state: {
          ...state,
          filters: {},
          pagination: {
            current: 1,
            pageSize: 10,
          },
        },
        query,
        ...restRoute,
      });
    } else {
      const { filters } = this.props;
      const { rangeTime, ...rest } = this.form.getValues();

      const finalFilters = { ...filters, ...rest };

      // 保留用户的查询参数
      router.replace({
        pathname: this.props.location.pathname,
        state: {
          ...state,
          filters: { ...filterObject(finalFilters) },
          pagination: defaultPagination,
        },
        query,
        ...restRoute,
      });
    }

    const { rangeTime, ...rest } = this.form.getValues();
    this.form.validate(() => {
      // 最后一步才执行，其他的操作先执行

      if (!_.isEmpty(rangeTime)) {
        rest.start_time =
          rangeTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).valueOf() / 1000;
        rest.end_time =
          rangeTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).valueOf() / 1000;
      }
      this.onRead(defaultPagination, filterObject(rest));

      if (extraCallback) {
        extraCallback(rest);
      }
    });
  };

  cleanSelectedKeys = () => {
    this.onRowSelectChange([], []);
  };

  render() {
    const {
      title,
      form,
      list,
      pagination,
      loading,
      rowKey,
      drag,
      columns,
      selectedRowKeys,
      renderOperator,
      onCreate,
      onExport,
      onExpand,
      learnRemindText,
      articleDetail,
      classEnding,
      onLearn,
      onArticle,
      onClassEnding,
      expandText,
      infobar,
      toolbar,
      createText,
      expandedRowRender,
      hideInBread,
      initFormValues,
      goBack,
      hasSelected,
      disabled = false,
      style,
      hideSelectedInfo,
    } = this.props;
    const paginationProps = pagination === false ? false : {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    // const hasSelected = selectedRowKeys;
    // selectedRowKeys = [...this.state.selectedRowKeys,...selectedRowKeys];

    const rowSelection = hasSelected
      ? {
        selectedRowKeys: [...selectedRowKeys],
        onChange: this.onRowSelectChange,
        getCheckboxProps: record => {
          if (disabled === 'selected' && selectedRowKeys.includes(record[rowKey])) {
            return { disabled: true };
          } else {
            return { disabled: false };
          }
        },
      }
      : null;

    const onBackButton = goBack ? (
      <Button type="ghost" key="goback" className={styles.goback} onClick={() => router.goBack()}>
        返回
      </Button>
    ) : (
        false
      );

    const setTable = drag ? (
      <DndProvider backend={HTML5Backend}>
        <Table
          expandedRowRender={expandedRowRender}
          loading={loading}
          rowKey={rowKey}
          rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={this.onChange}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
        />
      </DndProvider>
    ) : (
        <Table
          expandedRowRender={expandedRowRender}
          loading={loading}
          rowKey={rowKey}
          rowSelection={rowSelection}
          dataSource={list}
          columns={columns}
          pagination={paginationProps}
          onChange={this.onChange}
        />
      );

    this.form.reset(); // 先清空，再设置，避免干扰

    // 分开处理rangeTime 和其他的过滤参数
    const { rangeTime = [], start_time, end_time, ...restFormFilter } = this.props.filters ? this.props.filters : {};

    if (rangeTime) {
      rangeTime.map(i => moment(i, dateFormat));
    }

    if (start_time && end_time) {
      rangeTime.push(moment.unix(start_time));
      rangeTime.push(moment.unix(end_time));
    }
    console.log(rangeTime, 'time range');

    const lastFormFilter = { ...initFormValues, ...restFormFilter };
    this.form.setValues(lastFormFilter); // 将过滤条件设置显示
    this.form.setValue('rangeTime', rangeTime)

    return (
      <Page
        style={style}
        title={title}
        hideInBread={hideInBread}
        onBackButton={goBack && onBackButton}
      >
        <div className={styles.standardTable}>
          {form && (
            <Form core={this.form} direction="horizontal">
              {isValidElement(form) ? form : form.render(this.form) || ''}
              <div className="searchBtn">
                <Button type="primary" onClick={this.onSearch}>
                  查询
                </Button>
                <Button onClick={() => this.onSearch('reset')}>重置</Button>
              </div>
            </Form>
          )}
          {infobar}
          <div className="tableListOperator">
            {onCreate && (
              <Authorized action="create">
                <Button icon="plus" type="primary" onClick={onCreate}>
                  {createText || '新建'}
                </Button>
              </Authorized>
            )}
            {onExport && (
              <Authorized action="export">
                <Button type="primary" onClick={onExport}>
                  批量导出
                </Button>
              </Authorized>
            )}
            {onExpand && (
              <Authorized action="onExpand">
                <Button type="primary" onClick={onExpand}>
                  {expandText || '扩展'}
                </Button>
              </Authorized>
            )}
            {onLearn && (
              <Authorized action="onLearn">
                <Button type="primary" onClick={onLearn}>
                  {learnRemindText || ''}
                </Button>
              </Authorized>
            )}
            {onArticle && (
              <Authorized action="onArticle">
                <Button type="primary" onClick={onArticle}>
                  {articleDetail || ''}
                </Button>
              </Authorized>
            )}
            {onClassEnding && (
              <Authorized action="onClassEnding">
                <Button type="primary" onClick={onClassEnding}>
                  {classEnding || ''}
                </Button>
              </Authorized>
            )}
            {toolbar}
          </div>
          {hideSelectedInfo && (
            <div className={styles.tableAlert}>
              <Alert
                message={
                  <>
                    已选择 <a style={{ fontWeight: 600 }}>{this.state.selectedRowKeys.length}</a>{' '}
                    项&nbsp;&nbsp;
                    {!!this.state.selectedRowKeys.length && (
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
          {setTable}
        </div>
      </Page>
    );
  }
}

export default PageTable;
