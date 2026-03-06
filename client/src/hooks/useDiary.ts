import { useCallback } from 'react'
import api from '../utils/api'
import { useStore } from '../store/StoreContext'
import type { Diary, DiaryPage } from '../types'

export function useDiary() {
    const { diaries, setDiaries, updateDiaryInList, removeDiaryFromList } = useStore()

    const fetchDiaries = useCallback(async () => {
        const res = await api.get('/diaries')
        setDiaries(res.data.diaries)
    }, [])

    const createDiary = useCallback(async (name: string, cover: string, password?: string): Promise<Diary> => {
        const res = await api.post('/diaries', { name, cover, password })
        setDiaries([res.data.diary as Diary, ...diaries])
        return res.data.diary
    }, [])

    const deleteDiary = useCallback(async (id: string) => {
        await api.delete(`/diaries/${id}`)
        removeDiaryFromList(id)
    }, [])

    const updateDiary = useCallback(async (id: string, data: Partial<Diary>): Promise<Diary> => {
        const res = await api.patch(`/diaries/${id}`, data)
        updateDiaryInList(res.data.diary)
        return res.data.diary
    }, [])

    const unlockDiary = useCallback(async (id: string, password: string): Promise<boolean> => {
        const res = await api.post(`/diaries/${id}/unlock`, { password })
        return res.data.unlocked
    }, [])

    const getDiary = useCallback(async (id: string): Promise<Diary> => {
        const res = await api.get(`/diaries/${id}`)
        return res.data.diary
    }, [])

    const getPages = useCallback(async (diaryId: string): Promise<DiaryPage[]> => {
        const res = await api.get(`/diaries/${diaryId}/pages`)
        return res.data.pages
    }, [])

    const addPage = useCallback(async (diaryId: string, theme: string): Promise<DiaryPage> => {
        const res = await api.post(`/diaries/${diaryId}/pages`, { theme })
        return res.data.page
    }, [])

    const updatePage = useCallback(async (diaryId: string, pageId: string, data: Partial<DiaryPage>): Promise<DiaryPage> => {
        const res = await api.patch(`/diaries/${diaryId}/pages/${pageId}`, data)
        return res.data.page
    }, [])

    const deletePage = useCallback(async (diaryId: string, pageId: string) => {
        await api.delete(`/diaries/${diaryId}/pages/${pageId}`)
    }, [])

    return { diaries, fetchDiaries, createDiary, deleteDiary, updateDiary, unlockDiary, getDiary, getPages, addPage, updatePage, deletePage }
}