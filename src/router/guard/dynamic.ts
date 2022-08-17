import { RouteRecordRaw } from 'vue-router';
import { BasicLayout } from '@/layouts/index';

// 引入所有页面
const modules = import.meta.glob('../../views/**/*.vue');
/* 将路由树转换成一维数组 */
function FlatAuthRoutes(routes: AppRoute.Route[]) {
  let result: AppRoute.Route[] = [];
  // 浅拷贝一层去降维，否则影响原数组
  const _routes = JSON.parse(JSON.stringify(routes));
  _routes.forEach((item: any) => {
    if (item.children) {
      const temp = item.children || [];
      delete item.children;
      result.push(item);
      result = [...result, ...FlatAuthRoutes(temp)];
    } else {
      result.push(item);
    }
  });
  return result;
}
export async function createDynamicRoutes(routes: AppRoute.Route[]) {
  // 数组降维成一维数组,然后删除所有的childen
  const flatRoutes = FlatAuthRoutes(routes);
  // 生成路由，有redirect的不需要引入文件
  const mapRoutes = flatRoutes.map((item) => {
    if (!item.redirect) {
      // 动态加载对应页面
      item['component'] = modules[`../../views${item.path}/index.vue`];
    }
    return item;
  });

  const appRootRoute: RouteRecordRaw = {
    path: '/',
    name: 'appRoot',
    redirect: '/dashboard/workbench',
    component: BasicLayout,
    children: [],
  };
  // 根据角色过滤后的插入根路由中
  appRootRoute.children = mapRoutes as unknown as RouteRecordRaw[];
  return appRootRoute;
}
