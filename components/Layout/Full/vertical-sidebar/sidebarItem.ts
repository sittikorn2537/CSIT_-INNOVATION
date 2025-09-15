// composables/sidebar-items.ts (หรือไฟล์เดิมของคุณ)
import {
  LayoutDashboardIcon,
  PhotoIcon,
  ShoppingCartIcon,
  CategoryIcon,
  BriefcaseIcon,
  ToolsIcon,
  UsersIcon,
  LoginIcon,
  UserPlusIcon,
  MoodHappyIcon,
  FileDescriptionIcon,
} from 'vue-tabler-icons'

export interface menu {
  header?: string
  title?: string
  icon?: any              // ใส่คอมโพเนนต์ไอคอนได้เลย
  to?: string
  chip?: string
  BgColor?: string
  chipBgColor?: string
  chipColor?: string
  chipVariant?: string
  chipIcon?: string
  children?: menu[]
  disabled?: boolean
  type?: string
  subCaption?: string
  external?: boolean
}

const sidebarItem: menu[] = [
  { header: 'Home' },
  {
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    to: '/admin/dashboard',
  },
  {
    title: 'รูปภาพสไลด์',
    icon: PhotoIcon,
    to: '/admin/slide',
  },
  {
    title: 'สินค้า',
    icon: ShoppingCartIcon,
    to: '/admin/products',
  },
  {
    title: 'หมวดหมู่สินค้า',
    icon: CategoryIcon,
    to: '/admin/categories',
  },
  {
    title: 'ผลงานของเรา',
    icon: BriefcaseIcon,
    to: '/admin/work',
  },
    {
    title: 'หมวดหมู่ผลงาน',
    icon: BriefcaseIcon,
    to: '/admin/category_work',
  },
  {
    title: 'บริการ',
    icon: ToolsIcon,
    to: '/admin/services',
  },
  {
    title: 'ลูกค้าของเรา',
    icon: UsersIcon,
    to: '/admin/clients',
  },

  { header: 'Auth' },
  {
    title: 'Login',
    icon: LoginIcon,
    to: '/auth/login',
  },
  {
    title: 'Register',
    icon: UserPlusIcon,
    to: '/auth/register',
  },

  { header: 'Extra' },
  {
    title: 'Icons',
    icon: MoodHappyIcon, // หรือจะเปลี่ยนเป็น Icon เฉพาะทางอื่นก็ได้
    to: '/pages/icons',
  },
  {
    title: 'Sample Page',
    icon: FileDescriptionIcon,
    to: '/pages/sample-page',
  },
]

export default sidebarItem