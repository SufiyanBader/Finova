import {
  BarChart3,
  Receipt,
  PieChart,
  RefreshCw,
  Shield,
  Zap,
  UserPlus,
  PlusCircle,
  LineChart,
} from "lucide-react";



export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-emerald-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with interactive charts and comprehensive financial reports.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-emerald-600" />,
    title: "Smart Receipt Scanner",
    description:
      "AI-powered receipt scanning automatically extracts transaction details, saving you time on manual data entry.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-emerald-600" />,
    title: "Budget Planning",
    description:
      "Set and track budgets across different categories to stay in control of your monthly spending.",
  },
  {
    icon: <RefreshCw className="h-8 w-8 text-emerald-600" />,
    title: "Recurring Transactions",
    description:
      "Automate your regular income and expenses with smart recurring transaction scheduling.",
  },
  {
    icon: <Shield className="h-8 w-8 text-emerald-600" />,
    title: "Secure Platform",
    description:
      "Bank-level security with end-to-end encryption keeps your financial data safe and private.",
  },
  {
    icon: <Zap className="h-8 w-8 text-emerald-600" />,
    title: "Real-time Updates",
    description:
      "Instant transaction updates and live balance tracking so you always know where your money stands.",
  },
];

export const howItWorksData = [
  {
    icon: <UserPlus className="h-8 w-8 text-emerald-600" />,
    title: "Create Your Account",
    description:
      "Sign up in seconds and set up your financial accounts to start tracking your money immediately.",
  },
  {
    icon: <PlusCircle className="h-8 w-8 text-emerald-600" />,
    title: "Add Your Transactions",
    description:
      "Manually add transactions or use our AI scanner to capture receipts and log expenses automatically.",
  },
  {
    icon: <LineChart className="h-8 w-8 text-emerald-600" />,
    title: "Analyze and Optimize",
    description:
      "Review your financial reports, identify trends, and make smarter decisions about your spending.",
  },
];


