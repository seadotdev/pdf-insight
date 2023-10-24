import React from "react";
import {
  CalendarIcon,
  FolderIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { NavItem } from "./Sidebar";

export const defaultNavItems: NavItem[] = [
  {
    label: "Lending Workflow Tools",
    href: "/",
    icon: <HomeIcon className="w-6 h-6" />,
  },
  {
    label: "Underwriting tools",
    href: "/team",
    icon: <UserGroupIcon className="w-6 h-6" />,
  },
  {
    label: "Document templates",
    href: "/projects",
    icon: <FolderIcon className="w-6 h-6" />,
  },
  {
    label: "Deployed Agents",
    href: "/calendar",
    icon: <CalendarIcon className="w-6 h-6" />,
  },
];


// 1. **Lending Workflow tools** - Finance Tools ****(Lending) = testing value of LLM tools 
//     1. 🔍 **Underwriting tools**
//     2. 📄 **Document templates**
//     3. 🔁 **Deployed Agents -** agents doing shit
// 2. **Semantic Layer -** Data Discovery (general) = testing value of Fintech data platform 
//     1. 🔧 **Data Model -** Flexible, evolving, unified Data model, 
//     2. 🌐 **Data Explore -** Explore, discover, use your data 
//     3. 🎚️ **Data Activation -** Segment and push data into other tools (Reverse ETL or CDP style)
// 3. **Data integration** (plumbing) = testing the needs of buyers to sync with their ecosystem 
//     1. 🎛️ **Sources** - Connect to sources - pull from customer tools
//     2. **🎯 Targets -** Connect to targets - push into internal CRMS