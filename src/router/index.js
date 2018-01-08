import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index.vue'
import login from '@/components/global/login.vue'
import user from '@/components/sys/user.vue'
import userOpt from '@/components/sys/user.opt.vue'
import role from '@/components/sys/role.vue'
import roleOpt from '@/components/sys/role.opt.vue'
import menu from '@/components/sys/menu.vue'
import organize from '@/components/sys/organize.vue'
import organizeUser from '@/components/sys/organize.user.vue'
import platform from '@/components/sys/platform.vue'
import platformAdd from '@/components/sys/platform.add.vue'
import dict from '@/components/dict/dict.vue'
import dictclass from '@/components/dict/dictclass.vue'
import digital from '@/components/sys/digital.vue'
import house from '@/components/sys/house.vue'
import community from '@/components/sys/community.vue'
import model from '@/components/sys/model.vue'
import enroll from '@/components/sys/enroll.vue'
import case_ from '@/components/sys/case.vue'
import caseAdd from '@/components/sys/case.opt.vue'
import video from '@/components/cm/video.vue'
import notice from '@/components/cm/notice.vue'
import help from '@/components/cm/help.vue'
import news from '@/components/cm/news.vue'
import designer from '@/components/cm/designer.vue'
import decorate from '@/components/cm/decorate.vue'
import message from '@/components/cms/message.vue'
import app from '@/components/cms/app.vue'
import type from '@/components/cms/type.vue'
import banner from '@/components/cm/banner.vue'
import coop from '@/components/co/coop.vue'
import updateDiary from '@/components/cm/updateDiary.vue'
import task from '@/components/sys/task.vue'
import taskOpt from '@/components/sys/task.opt.vue'
import operator from '@/components/sys/operator.vue'
import designerPartner from '@/components/cm/designerPartner.vue'
import designerPartnerOpt from '@/components/cm/designerPartner.opt.vue'
import citySite from '@/components/map/citySite.vue'
import content from '@/components/co/content.vue'
import classification from '@/components/co/classification.vue'
import brand from '@/components/co/brand.vue'
Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/home',
      name: 'home',
      component: index
    },
    {
      path: '/co/brand',
      name: 'co-brand',
      component: brand
    },
    {
      path: '/co/classification',
      name: 'co-classification',
      component: classification
    },
    {
      path: '/co/content',
      name: 'co-content',
      component: content
    },
    {
      path: '/cm/designerPartner/edit',
      name: 'cm-designerPartner-edit',
      component: designerPartnerOpt
    },
    {
      path: '/cm/designerPartner',
      name: 'cm-designerPartner',
      component: designerPartner,
      meta: { keepAlive: true }
    },
    {
      path: '/cm/updateDiary',
      name: 'cm-updateDiary',
      component: updateDiary
    },
    {
      path: '/co/coop',
      name: 'co-coop',
      component: coop
    },
    {
      path: '/cm/banner',
      name: 'cm-banner',
      component: banner
    },
    {
      path: '/cms/type',
      name: 'cms-type',
      component: type
    },
    {
      path: '/cms/app',
      name: 'cms-app',
      component: app
    },
    {
      path: '/cms/message',
      name: 'cms-message',
      component: message
    },
    {
      path: '/cm/designer',
      name: 'cm-designer',
      component: designer,
      meta: { keepAlive: true }
    },
    {
      path: '/cm/decorate',
      name: 'cm-decorate',
      component: decorate
    },
    {
      path: '/cm/help',
      name: 'cm-help',
      component: help
    },
    {
      path: '/cm/news',
      name: 'cm-news',
      component: news
    },
    {
      path: '/cm/notice',
      name: 'cm-notice',
      component: notice
    },
    {
      path: '/cm/video',
      name: 'cm-video',
      component: video
    },
    {
      path: '/sys/case/add',
      name: 'sys-case-add',
      component: caseAdd
    },
    {
      path: '/sys/case/edit',
      name: 'sys-edit',
      component: caseAdd
    },
    {
      path: '/sys/case/view',
      name: 'sys-view',
      component: caseAdd
    },
    {
      path: '/sys/case',
      name: 'sys-case',
      component: case_,
      meta: { keepAlive: true }
    },
    {
      path: '/sys/platform',
      name: 'sys-platform',
      component: platform
    },
    {
      path: '/sys/enroll',
      name: 'sys-enroll',
      component: enroll
    },
    {
      path: '/sys/model',
      name: 'sys-model',
      component: model
    },
    {
      path: '/sys/community',
      name: 'sys-community',
      component: community
    },
    {
      path: '/sys/house',
      name: 'sys-house',
      component: house
    },
    {
      path: '/sys/digital',
      name: 'sys-digital',
      component: digital
    },
    {
      path: '/dict/dictclass',
      name: 'sys-dictclass',
      component: dictclass
    },
    {
      path: '/dict/dict',
      name: 'sys-dict',
      component: dict
    },
    {
      path: '/sys/platform/add',
      name: 'sys-platform-add',
      component: platformAdd
    },
    {
      path: '/sys/organize',
      name: 'sys-organize',
      component: organize
    },
    {
      path: '/sys/organize/user',
      name: 'sys-organize-user',
      component: organizeUser
    },
    {
      path: '/sys/menu',
      name: 'sys-menu',
      component: menu
    },
    {
      path: '/sys/role',
      name: 'sys-role',
      component: role
    },
    {
      path: '/sys/role/add',
      name: 'role-add',
      component: roleOpt
    },
    {
      path: '/sys/role/edit',
      name: 'role-edit',
      component: roleOpt
    },
    {
      path: '/sys/role/view',
      name: 'role-view',
      component: roleOpt
    },
    {
      path: '/sys/user',
      name: 'sys-user',
      component: user
    },
    {
      path: '/sys/user/add',
      name: 'user-add',
      component: userOpt
    },
    {
      path: '/sys/user/edit',
      name: 'user-edit',
      component: userOpt
    },
    {
      path: '/sys/user/view',
      name: 'user-view',
      component: userOpt
    },
    {
      path: '/login',
      name: 'login',
      component: login
    },
    {
      path: '/sys/task',
      name: 'task',
      component: task
    },
    {
      path: '/sys/task/add',
      name: 'task-add',
      component: taskOpt
    },
    {
      path: '/sys/task/edit',
      name: 'task-edit',
      component: taskOpt
    },
    {
      path: '/sys/task/view',
      name: 'task-view',
      component: taskOpt
    },
    {
      path: '/sys/operator',
      name: 'operator',
      component: operator
    },
    {
      path: '/map/citySite',
      name: 'citySite',
      component: citySite
    }
  ]
})
