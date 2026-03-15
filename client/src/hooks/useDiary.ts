import { useCallback } from 'react'
import api from '../utils/api'
import { useStore } from '../store/StoreContext'
import type { Diary, DiaryPage } from '../types'

export function useDiary() {
    const { diaries, setDiaries, updateDiaryInList, removeDiaryFromList } = useStore()

    const fetchDiaries = useCallback(async () => {
        const data = await api.get('/diaries')
        setDiaries(Array.isArray(data) ? data : [])
    }, [])

    const createDiary = useCallback(async (name: string, cover: string, password?: string): Promise<Diary> => {
        const diary = await api.post('/diaries', { name, cover, password }) as Diary
        setDiaries((prev: Diary[]) => [diary, ...prev])
        return diary
    }, [])


    const deleteDiary = useCallback(async (id: string) => {
        await api.delete(`/diaries/${id}`)
        removeDiaryFromList(id)
    }, [removeDiaryFromList])

    const updateDiary = useCallback(async (id: string, updates: Partial<Diary>): Promise<Diary> => {
        const diary = await api.put(`/diaries/${id}`, updates) as Diary
        updateDiaryInList(diary)
        return diary
    }, [updateDiaryInList])

    const unlockDiary = useCallback(async (id: string, password: string): Promise<boolean> => {
        const res = await api.post(`/diaries/${id}/unlock`, { password }) as { unlocked: boolean }
        return res.unlocked
    }, [])

    const getDiary = useCallback(async (id: string): Promise<Diary> => {
        const diary = await api.get(`/diaries/${id}`) as Diary
        return diary
    }, [])

    const getPages = useCallback(async (diaryId: string): Promise<DiaryPage[]> => {
        const pages = await api.get(`/diaries/${diaryId}/pages`)
        return (Array.isArray(pages) ? pages : []) as DiaryPage[]
    }, [])

    const addPage = useCallback(async (diaryId: string, theme: string): Promise<DiaryPage> => {
        const page = await api.post(`/diaries/${diaryId}/pages`, { theme }) as DiaryPage
        return page
    }, [])

    const updatePage = useCallback(async (diaryId: string, pageId: string, data: Partial<DiaryPage>): Promise<DiaryPage> => {
        const page = await api.patch(`/diaries/${diaryId}/pages/${pageId}`, data) as DiaryPage
        return page
    }, [])

    const deletePage = useCallback(async (diaryId: string, pageId: string) => {
        await api.delete(`/diaries/${diaryId}/pages/${pageId}`)
    }, [])

    return { diaries, fetchDiaries, createDiary, deleteDiary, updateDiary, unlockDiary, getDiary, getPages, addPage, updatePage, deletePage }
}
