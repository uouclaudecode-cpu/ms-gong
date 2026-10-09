import { useEffect } from 'react';
import { usePicks } from '../context/PickContext.jsx';
import { fetchJobs } from '../data/api.js';
import { useAsync } from './useAsync.js';

/** 진행 중 공고 전체 + 그 안의 '목록 밖 공공기관' 이름을 기억해 두기 */
export function useJobs() {
  const { addInstitutions } = usePicks();
  const state = useAsync(fetchJobs, []);
  useEffect(() => {
    if (state.data?.institutions) addInstitutions(state.data.institutions);
  }, [state.data, addInstitutions]);
  return state;
}
