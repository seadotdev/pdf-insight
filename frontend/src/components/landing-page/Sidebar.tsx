import React from "react";
import cn from "classnames";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
// 👇 props to get and set the collapsed state from parent component
type Props = {
  collapsed: boolean;
  setCollapsed(collapsed: boolean): void;
};
const Sidebar = ({ collapsed, setCollapsed }: Props) => {
  // 👇 use the correct icon depending on the state.
  const Icon = collapsed ? ChevronDoubleRightIcon : ChevronDoubleLeftIcon;
  return (
    <div
      className={cn({
        "bg-indigo-700 text-zinc-50 z-20": true,
      })}
    >
      <div
        className={cn({
          "flex flex-col justify-between": true,
          "h-full": true,
        })}
      >
        {/* logo and collapse button */}
        ...
        <div
          className={cn({
            "grid place-content-stretch p-4": true,
          })}
        >
          <div className="flex gap-4 items-center h-11 overflow-hidden">
            <Image
              src={"/tc.png"}
              height={36}
              width={36}
              alt="profile image"
              className="rounded-full"
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-indigo-50 my-0">Tom Cook</span>
                <Link href="/" className="text-indigo-200 text-sm">
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
