import { useContext } from 'solid-js';
import { SessionContext } from '../contexts/session';

export const useSession = () => useContext(SessionContext)!;
