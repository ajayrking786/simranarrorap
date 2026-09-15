/**
 * notificationService.ts — In-app notification management.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Notification, NotificationType } from '@/types';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'INFO'
): Promise<void> {
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title: title.trim(),
    message: message.trim(),
    type,
    read: false,
  });

  if (error) {
    console.error('[notificationService] createNotification error:', error);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('[notificationService] getUnreadCount error:', error);
    return 0;
  }

  return count ?? 0;
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('[notificationService] getNotifications error:', error);
    return [];
  }

  return (data ?? []) as Notification[];
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    console.error('[notificationService] markAsRead error:', error);
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('[notificationService] markAllAsRead error:', error);
  }
}
