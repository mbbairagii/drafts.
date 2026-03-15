import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Diary, User } from '../types'

interface StoreCtx {
    user: User | null
    token: string | null
    diaries: Diary[]
    setUser: (u: User | null) => void
    setToken: (t: string | null) => void
    setDiaries: (d: Diary[] | ((prev: Diary[]) => Diary[])) => void
    updateDiaryInList: (d: Diary) => void
    removeDiaryFromList: (id: string) => void
}

const StoreContext = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
    const [diaries, setDiaries] = useState<Diary[]>([])

    const updateDiaryInList = useCallback((d: Diary) => {
        setDiaries(prev => prev.map(x => x._id === d._id ? d : x))
    }, [])

    const removeDiaryFromList = useCallback((id: string) => {
        setDiaries(prev => prev.filter(x => x._id !== id))
    }, [])

    return (
        <StoreContext.Provider value={{ user, token, diaries, setUser, setToken, setDiaries, updateDiaryInList, removeDiaryFromList }}>
            {children}
        </StoreContext.Provider>
    )
}

export function useStore(): StoreCtx {
    const ctx = useContext(StoreContext)
    if (!ctx) throw new Error('useStore outside StoreProvider')
    return ctx
}
