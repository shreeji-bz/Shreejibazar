import { useState, useCallback } from 'react';

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const fetchUsers = useCallback(async () => {}, []);
  return { users, fetchUsers, setUsers };
}
