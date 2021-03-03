import React from 'react';
import { Card } from 'antd';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import MenuContext from "components/Utils/MenuContext";

export default ({ title, children,hideInBread=true, cardProps = {}, onBackButton=[], style={} }) => (
  <div>
    <MenuContext.Consumer>
      {
          value=>(
            <PageHeaderLayout title={title} style={style} extra={onBackButton} hideInBread={hideInBread} {...value}>
              <Card bordered={false} {...cardProps}>
                <div className="tableList">{children}</div>
              </Card>
            </PageHeaderLayout>
            )
}
    </MenuContext.Consumer>
  </div>
);
