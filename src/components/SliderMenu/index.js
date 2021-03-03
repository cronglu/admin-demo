import React, { PureComponent } from 'react';
import { Layout, Menu, Icon } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Link from 'umi/link';
import router from 'umi/router';
import styles from './index.less';

const { Sider } = Layout;
const { SubMenu } = Menu;

/**
 * 
 * 讲url 转换成递进的 url 列表 eg. a/b/c 转换成  a、a/b、 a/b/c 三种
 * @param pathname
 */
export function urlToList(pathname) {
  const url = pathname || '/';
  const urllist = url.split('/').filter(i => i);
  return urllist.map((urlItem, index) => {
    return `/${urllist.slice(0, index + 1).join('/')}`;
  });
}

// Allow menuTree.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = icon => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={styles.icon} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
};

export const getMeunMatcheys = (flatMenuKeys, path) => {
  return flatMenuKeys.filter(item => {
    // return true;
    return pathToRegexp(String(item)).test(path);
  });
};

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
      });
    }
  }

  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const {
      location: { pathname = '/' },
    } = props || this.props;
    return urlToList(pathname)
      .map(item => {
        return getMeunMatcheys(this.flatMenuKeys, item)[0];
      })
      .filter(item => item);
  }

  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SliderMenu
   */
  getMenuItemPath = item => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    return (
      <div
        onClick={() => {
          const { isMobile, location } = this.props;
          if (isMobile) {
            this.props.onCollapse(true);
          }

          if (location.pathname !== itemPath) {
            router.push(itemPath);
          }
        }}
      >
        {icon}
        <span>{name}</span>
      </div>
    );
  };

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    if (item.children && item.children.some(child => child.name && !child.hideInMenu)) {
      return (
        <SubMenu
          title={
            item.icon ? (
              <span>
                {getIcon(item.icon)}
                <span>{item.name}</span>
              </span>
            ) : (
                item.name
              )
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    } else {
      return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>;
    }
  };

  /**
   * 获得菜单子节点
   * @memberof SliderMenu
   */
  getNavMenuItems = menusData => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => {
        // make dom
        return this.getSubMenuOrItem(item);
      })
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const {
      location: { pathname },
    } = this.props;
    return urlToList(pathname).map(itemPath => getMeunMatcheys(this.flatMenuKeys, itemPath).pop());
  };

  // conversion Path
  // 转化路径
  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };

  handleOpenChange = openKeys => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = this.menus.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  };

  render() {
    const { logo, collapsed, onCollapse } = this.props;
    const { openKeys } = this.state;
    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed
      ? {}
      : {
        openKeys,
      };
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys();
    if (!selectedKeys.length) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        className={styles.sider}
      >
        <div className={styles.logo} key="logo">
          <Link to="/">
            <h1>金牌宠物后台</h1>
          </Link>
        </div>
        <Menu
          key="Menu"
          theme="dark"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
          style={{ padding: '16px 0', width: '100%' }}
        >
          {this.getNavMenuItems(this.menus)}
        </Menu>
      </Sider>
    );
  }
}
