import {
  LayoutDashboardIcon,
  BorderAllIcon,
  AlertCircleIcon,
  CircleDotIcon,
  BoxMultiple1Icon,
  LoginIcon,
  MoodHappyIcon,
  ApertureIcon,
  UserPlusIcon,
} from "vue-tabler-icons";

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  external?: boolean;
}

const sidebarItem: menu[] = [
  { header: "Home" },
  {
    title: "Dashboard",
    icon: "graph-new-linear",
    to: "/",
  },
  {
    title: "Front Pages",
    icon: "home-angle-linear",
    to: "/frontpages",
    children: [
      {
        title: "Homepage",
        to: "https://spike-nuxtjs-pro-main.netlify.app/front-pages/homepage",
        chip: "Pro",
        external: true,
      },
    ],
  },

  { header: "Auth" },
  {
    title: "Login",
    icon: "user-linear",
    to: "/auth/login",
  },
  {
    title: "Register",
    icon: "user-hand-up-linear",
    to: "/auth/register",
  },
  { header: "Extra" },
  {
    title: "Icons",
    icon: "ghost-smile-outline",
    to: "/pages/icons",
  },
  {
    title: "Sample Page",
    icon: "book-bookmark-linear",
    to: "/pages/sample-page",
  },
];

export default sidebarItem;
