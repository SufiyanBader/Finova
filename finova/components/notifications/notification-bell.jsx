"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
} from "@/actions/notifications";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const {
    fn: fetchFn,
    data: notifications,
  } = useFetch(getNotifications);

  const { loading: markAllLoading, fn: markAllFn } = useFetch(markAllAsRead);

  const { fn: deleteFn } = useFetch(deleteNotification);

  useEffect(() => {
    if (open) {
      fetchFn();
    }
  }, [open, fetchFn]);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkAllRead = async () => {
    await markAllFn();
    fetchFn();
    toast.success("All notifications marked as read");
  };

  const handleDelete = async (id) => {
    await deleteFn(id);
    fetchFn();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "budget-alert":
        return <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />;
      case "goal-completed":
        return <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />;
      case "recurring":
        return <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllLoading}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                  !notification.isRead && "bg-emerald-50 dark:bg-emerald-950/20"
                )}
              >
                {getNotificationIcon(notification.type)}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.createdAt), "PP")}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t text-center">
          <span className="text-xs text-muted-foreground">
            Showing last 20 notifications
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
