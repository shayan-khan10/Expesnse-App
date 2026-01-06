import {
  LayoutGrid,
  Home,
  Users,
  Receipt,
  BarChart3,
  User,
} from "lucide-react"

export const navigation = [
  { title: "Home", url: "/", icon: Home },
  { title: "Family", url: "/family", icon: Users },
  { title: "Categories", url: "/categories", icon: LayoutGrid },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

export const settings = [
  { title: "Profile", url: "/profile", icon: User },
]