import type { SandboxFile } from "./sandbox";
import { FINANCIAL_DASHBOARD_FILES } from "./fixtures/financial-dashboard";
import { SAAS_ANALYTICS_FILES } from "./fixtures/saas-analytics";
import { LOGIN_PAGE_FILES } from "./fixtures/login-page";
import { PRICING_PAGE_V2_FILES } from "./fixtures/pricing-page-v2";
import { KANBAN_BOARD_FILES } from "./fixtures/kanban-board";
import { ECOMMERCE_PRODUCT_FILES } from "./fixtures/ecommerce-product";
import { CHAT_UI_FILES } from "./fixtures/chat-ui";
import { TEAM_SETTINGS_FILES } from "./fixtures/team-settings";
import { DATA_TABLE_FILES } from "./fixtures/data-table";

export interface DemoPrompt {
  /** Short label shown as a chip in the UI. */
  label: string;
  /** Emoji or icon hint. Optional. */
  icon?: string;
  /** Full prompt sent to the pipeline. */
  prompt: string;
  /** Pre-baked successful output served as a fallback if the live pipeline fails. */
  files?: SandboxFile[];
}

export const DEMO_PROMPTS: DemoPrompt[] = [
  {
    label: "Financial dashboard",
    icon: "TrendingUp",
    prompt:
      "A financial dashboard with account balance summary, recent transactions list, monthly spending analytics, and a sidebar with quick actions.",
    files: FINANCIAL_DASHBOARD_FILES,
  },
  {
    label: "SaaS analytics",
    icon: "BarChart2",
    prompt:
      "A SaaS analytics dashboard with MRR, active users, churn rate, and NPS KPI cards; a user growth area chart; a monthly churn bar chart; and a top customers table sorted by revenue.",
    files: SAAS_ANALYTICS_FILES,
  },
  {
    label: "Login page",
    icon: "LogIn",
    prompt:
      "A polished login page with email and password fields, real-time validation, Google OAuth button, remember me checkbox, forgot password link, and a loading state on submit.",
    files: LOGIN_PAGE_FILES,
  },
  {
    label: "Pricing page",
    icon: "Tag",
    prompt:
      "A SaaS pricing page with three tiers (Free, Pro, Team), a monthly/annual billing toggle, feature comparison table, customer testimonials, and an FAQ accordion.",
    files: PRICING_PAGE_V2_FILES,
  },
  {
    label: "Kanban board",
    icon: "Columns",
    prompt:
      "A Kanban board with four columns (Backlog, In Progress, Review, Done), task cards showing priority badge and assignee avatar, drag visual indicators, and an add task button per column.",
    files: KANBAN_BOARD_FILES,
  },
  {
    label: "E-commerce product",
    icon: "ShoppingBag",
    prompt:
      "An e-commerce product detail page with an image gallery, color and size selectors, add to cart with quantity control, star ratings, tabbed description/reviews/specs section, and related products.",
    files: ECOMMERCE_PRODUCT_FILES,
  },
  {
    label: "Chat UI",
    icon: "MessageSquare",
    prompt:
      "A chat application with a left sidebar listing conversations with unread counts, a main message thread with sent/received bubbles and timestamps, typing indicator, and an input bar with emoji and file attachment buttons.",
    files: CHAT_UI_FILES,
  },
  {
    label: "Team settings",
    icon: "Users",
    prompt:
      "A team settings page with tabs for Members, Permissions, Billing, and Danger Zone. Members tab shows a table with roles, an invite form. Permissions tab shows a feature-role matrix. Danger zone has a delete workspace confirmation.",
    files: TEAM_SETTINGS_FILES,
  },
  {
    label: "Data table",
    icon: "Table",
    prompt:
      "A data table with 15 employee rows, column sorting by name/department/salary/joined date, search filter, department filter chips, row checkboxes with bulk actions bar, and pagination controls.",
    files: DATA_TABLE_FILES,
  },
];
